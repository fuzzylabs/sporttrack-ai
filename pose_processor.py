import cv2
import mediapipe as mp
import numpy as np
from typing import List, Tuple, Optional

class PoseProcessor:
    def __init__(self, params=None):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Default parameters - optimised for surfing movements
        self.params = params or {
            'min_detection_confidence': 0.4,  # Lower for earlier detection
            'min_tracking_confidence': 0.3,   # Lower for dynamic movements
            'model_complexity': 1,
            'confident_landmarks_threshold': 6,  # Relaxed from 8
            'key_parts_threshold': 2,  # Relaxed from 3
            'stability_ratio': 0.4,  # Relaxed from 0.6
            'history_size': 3,  # Smaller window for faster response
            'landmark_visibility_threshold': 0.4  # Lower threshold
        }
        
        # Track pose detection history for stability
        self.pose_history = []
        
        self.pose_detector = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=self.params['model_complexity'],
            smooth_landmarks=True,
            enable_segmentation=False,
            smooth_segmentation=True,
            min_detection_confidence=self.params['min_detection_confidence'],
            min_tracking_confidence=self.params['min_tracking_confidence']
        )
        
        # Define pose connections for drawing
        self.pose_connections = self.mp_pose.POSE_CONNECTIONS
    
    def is_pose_stable(self, landmarks):
        """Check if pose detection is stable enough to draw with temporal consistency"""
        if not landmarks:
            self.pose_history.append(False)
        else:
            # Count high-confidence landmarks using configurable threshold
            confident_landmarks = sum(1 for landmark in landmarks 
                                    if landmark.visibility > self.params['landmark_visibility_threshold'])
            
            # Check for key body parts (torso stability)
            key_parts = [11, 12, 23, 24]  # shoulders and hips
            key_parts_visible = sum(1 for i in key_parts 
                                  if i < len(landmarks) and landmarks[i].visibility > self.params['landmark_visibility_threshold'])
            
            # Current frame stability with configurable thresholds
            current_stable = (confident_landmarks >= self.params['confident_landmarks_threshold'] and 
                            key_parts_visible >= self.params['key_parts_threshold'])
            self.pose_history.append(current_stable)
        
        # Keep history size limited
        if len(self.pose_history) > self.params['history_size']:
            self.pose_history.pop(0)
        
        # Require temporal consistency with configurable ratio
        if len(self.pose_history) < 2:  # Reduced minimum history
            return False
        
        stable_count = sum(self.pose_history)
        stability_ratio = stable_count / len(self.pose_history)
        
        return stability_ratio >= self.params['stability_ratio']
    
    def update_params(self, new_params):
        """Update parameters and recreate pose detector if needed"""
        detector_params_changed = any(
            key in new_params and new_params[key] != self.params[key]
            for key in ['min_detection_confidence', 'min_tracking_confidence', 'model_complexity']
        )
        
        self.params.update(new_params)
        
        if detector_params_changed:
            # Recreate detector with new parameters
            self.pose_detector = self.mp_pose.Pose(
                static_image_mode=False,
                model_complexity=self.params['model_complexity'],
                smooth_landmarks=True,
                enable_segmentation=False,
                smooth_segmentation=True,
                min_detection_confidence=self.params['min_detection_confidence'],
                min_tracking_confidence=self.params['min_tracking_confidence']
            )
        
        # Reset pose history when parameters change
        self.pose_history = []
    
    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Optional[List]]:
        """Process a single frame and return annotated frame with pose landmarks"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose_detector.process(rgb_frame)
        
        annotated_frame = frame.copy()
        landmarks = None
        
        if results.pose_landmarks and self.is_pose_stable(results.pose_landmarks.landmark):
            # Draw pose landmarks with custom styling for better visibility
            landmark_drawing_spec = self.mp_drawing.DrawingSpec(
                color=(0, 255, 0),  # Green landmarks
                thickness=4,
                circle_radius=4
            )
            connection_drawing_spec = self.mp_drawing.DrawingSpec(
                color=(255, 0, 0),  # Red connections
                thickness=3
            )
            
            self.mp_drawing.draw_landmarks(
                annotated_frame,
                results.pose_landmarks,
                self.pose_connections,
                landmark_drawing_spec=landmark_drawing_spec,
                connection_drawing_spec=connection_drawing_spec
            )
            
            # Extract landmark coordinates
            landmarks = []
            for landmark in results.pose_landmarks.landmark:
                landmarks.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })
        
        return annotated_frame, landmarks
    
    def process_video(self, video_path: str, output_path: str) -> bool:
        """Process entire video and save annotated version"""
        # Reset pose history for new video
        self.pose_history = []
        
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            return False
        
        # Get video properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Create video writer with H.264 codec for better browser compatibility
        fourcc = cv2.VideoWriter_fourcc(*'H264')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # If H264 fails, try alternative codecs
        if not out.isOpened():
            print("H264 codec failed, trying XVID...")
            fourcc = cv2.VideoWriter_fourcc(*'XVID')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
        if not out.isOpened():
            print("XVID codec failed, trying mp4v...")
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        frame_count = 0
        poses_detected = 0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"Processing {total_frames} frames...")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            annotated_frame, landmarks = self.process_frame(frame)
            out.write(annotated_frame)
            
            if landmarks:
                poses_detected += 1
            
            frame_count += 1
            if frame_count % 50 == 0:  # Progress update every 50 frames
                progress = (frame_count / total_frames) * 100
                detection_rate = (poses_detected / frame_count) * 100
                print(f"Processing: {progress:.1f}% - Poses detected: {poses_detected}/{frame_count} ({detection_rate:.1f}%)")
        
        print(f"Completed! Total poses detected: {poses_detected}/{frame_count} ({(poses_detected/frame_count)*100:.1f}%)")
        
        cap.release()
        out.release()
        return True
    
    def get_pose_analysis(self, landmarks: List) -> dict:
        """Analyze pose landmarks for technique feedback"""
        if not landmarks:
            return {}
        
        analysis = {
            'pose_detected': True,
            'total_landmarks': len(landmarks),
            'confidence': sum(l['visibility'] for l in landmarks) / len(landmarks),
            'key_points': {
                'left_shoulder': landmarks[11] if len(landmarks) > 11 else None,
                'right_shoulder': landmarks[12] if len(landmarks) > 12 else None,
                'left_elbow': landmarks[13] if len(landmarks) > 13 else None,
                'right_elbow': landmarks[14] if len(landmarks) > 14 else None,
                'left_wrist': landmarks[15] if len(landmarks) > 15 else None,
                'right_wrist': landmarks[16] if len(landmarks) > 16 else None,
                'left_hip': landmarks[23] if len(landmarks) > 23 else None,
                'right_hip': landmarks[24] if len(landmarks) > 24 else None,
                'left_knee': landmarks[25] if len(landmarks) > 25 else None,
                'right_knee': landmarks[26] if len(landmarks) > 26 else None,
                'left_ankle': landmarks[27] if len(landmarks) > 27 else None,
                'right_ankle': landmarks[28] if len(landmarks) > 28 else None,
            }
        }
        
        return analysis