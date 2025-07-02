import os
import uuid
import threading
import time
from flask import Flask, render_template, request, jsonify, send_file, url_for, send_from_directory
from werkzeug.utils import secure_filename
from pose_processor import PoseProcessor
import cv2

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['PROCESSED_FOLDER'] = 'static/processed'

# Create directories if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)

# Initialize pose processor
pose_processor = PoseProcessor()

# Progress tracking
progress_tracker = {}

ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def update_progress(video_id, progress, message):
    """Update progress for a video processing task"""
    if video_id in progress_tracker:
        progress_tracker[video_id].update({
            'progress': progress,
            'message': message
        })

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Please upload MP4, AVI, MOV, or MKV files.'}), 400
    
    # Generate unique filename
    filename = secure_filename(file.filename)
    unique_id = str(uuid.uuid4())
    file_extension = filename.rsplit('.', 1)[1].lower()
    original_filename = f"{unique_id}_original.{file_extension}"
    processed_filename = f"{unique_id}_processed.{file_extension}"
    
    original_path = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)
    processed_path = os.path.join(app.config['PROCESSED_FOLDER'], processed_filename)
    
    try:
        # Save uploaded file
        file.save(original_path)
        
        # Process video with pose detection
        print(f"Processing video: {original_path}")
        print(f"Output will be saved to: {processed_path}")
        success = pose_processor.process_video(original_path, processed_path)
        
        if not success:
            return jsonify({'error': 'Failed to process video'}), 500
        
        # Verify the processed file exists and has content
        if not os.path.exists(processed_path) or os.path.getsize(processed_path) == 0:
            return jsonify({'error': 'Processed video file is empty or missing'}), 500
        
        print(f"✓ Processing complete. File size: {os.path.getsize(processed_path) / (1024*1024):.1f} MB")
        
        # Get video info
        cap = cv2.VideoCapture(original_path)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = frame_count / fps if fps > 0 else 0
        cap.release()
        
        return jsonify({
            'success': True,
            'video_id': unique_id,
            'original_url': url_for('static', filename=f'uploads/{original_filename}'),
            'processed_url': url_for('static', filename=f'processed/{processed_filename}'),
            'duration': round(duration, 2),
            'frame_count': frame_count,
            'fps': round(fps, 2)
        })
    
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/analyze/<video_id>')
def analyze_video(video_id):
    """Get pose analysis for a processed video"""
    try:
        # For demo purposes, return mock analysis data
        analysis = {
            'video_id': video_id,
            'pose_detection_confidence': 0.87,
            'total_frames_analyzed': 450,
            'poses_detected': 442,
            'detection_rate': 98.2,
            'key_metrics': {
                'average_pose_confidence': 0.89,
                'body_symmetry_score': 0.78,
                'movement_consistency': 0.82,
                'technique_score': 0.75
            },
            'recommendations': [
                'Maintain consistent arm positioning throughout the movement',
                'Focus on hip alignment for better balance',
                'Consider working on shoulder stability'
            ]
        }
        
        return jsonify(analysis)
    
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'SportTrack.ai'})

@app.route('/static/processed/<filename>')
def serve_processed_video(filename):
    """Serve processed videos with proper MIME type"""
    return send_from_directory(app.config['PROCESSED_FOLDER'], filename, mimetype='video/mp4')

@app.route('/static/uploads/<filename>')
def serve_uploaded_video(filename):
    """Serve uploaded videos with proper MIME type"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, mimetype='video/mp4')

@app.route('/parameters')
def get_parameters():
    """Get current pose detection parameters"""
    return jsonify(pose_processor.params)

@app.route('/parameters', methods=['POST'])
def update_parameters():
    """Update pose detection parameters"""
    try:
        new_params = request.json
        pose_processor.update_params(new_params)
        return jsonify({'success': True, 'params': pose_processor.params})
    except Exception as e:
        return jsonify({'error': f'Failed to update parameters: {str(e)}'}), 500

@app.route('/reprocess/<video_id>', methods=['POST'])
def reprocess_video(video_id):
    """Reprocess a video with updated parameters"""
    try:
        original_file = f"{video_id}_original.mp4"
        processed_file = f"{video_id}_processed.mp4"
        
        original_path = os.path.join(app.config['UPLOAD_FOLDER'], original_file)
        processed_path = os.path.join(app.config['PROCESSED_FOLDER'], processed_file)
        
        if not os.path.exists(original_path):
            return jsonify({'error': 'Original video not found'}), 404
        
        # Process with current parameters
        success = pose_processor.process_video(original_path, processed_path)
        
        if success:
            return jsonify({
                'success': True,
                'processed_url': url_for('serve_processed_video', filename=processed_file)
            })
        else:
            return jsonify({'error': 'Reprocessing failed'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Reprocessing failed: {str(e)}'}), 500

@app.route('/progress/<video_id>')
def get_progress(video_id):
    """Get processing progress for a video"""
    if video_id in progress_tracker:
        return jsonify(progress_tracker[video_id])
    else:
        return jsonify({'stage': 'unknown', 'progress': 0, 'message': 'Video not found'}), 404

@app.route('/debug/video/<video_id>')
def debug_video(video_id):
    """Debug endpoint to check video files"""
    original_file = f"{video_id}_original.mp4"
    processed_file = f"{video_id}_processed.mp4"
    
    original_path = os.path.join(app.config['UPLOAD_FOLDER'], original_file)
    processed_path = os.path.join(app.config['PROCESSED_FOLDER'], processed_file)
    
    debug_info = {
        'video_id': video_id,
        'original_exists': os.path.exists(original_path),
        'processed_exists': os.path.exists(processed_path),
        'original_size': os.path.getsize(original_path) if os.path.exists(original_path) else 0,
        'processed_size': os.path.getsize(processed_path) if os.path.exists(processed_path) else 0,
        'original_url': url_for('serve_uploaded_video', filename=original_file),
        'processed_url': url_for('serve_processed_video', filename=processed_file)
    }
    
    return jsonify(debug_info)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)