# SportTrack.ai Development Documentation

## Project Overview

SportTrack.ai is an AI-powered sports technique analysis application that uses MediaPipe pose detection to analyze video footage of athletes and provide real-time feedback on their movements and technique.

## Architecture

### Technology Stack
- **Backend**: Python 3.9+ with Flask
- **AI/ML**: Google MediaPipe for pose detection, OpenCV for video processing
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Deployment**: Vercel (serverless functions)
- **Storage**: Local filesystem for video processing

### Core Components

#### 1. Pose Processing Engine (`pose_processor.py`)
- **MediaPipe Integration**: Uses Google's MediaPipe Pose solution for human pose detection
- **33 Landmark Detection**: Tracks key body points including face, arms, torso, and legs
- **Configurable Parameters**: Adjustable detection confidence, tracking confidence, and stability requirements
- **Temporal Filtering**: Implements pose history tracking to reduce artifacts during rapid movements
- **Video Processing**: Processes entire videos frame-by-frame with real-time overlay generation

#### 2. Flask Web Application (`app.py`)
- **RESTful API**: Handles video upload, processing, and parameter management
- **Async Processing**: Video processing runs efficiently with progress tracking
- **Static File Serving**: Serves processed videos with proper MIME types
- **Parameter Tuning**: Real-time parameter adjustment and video reprocessing

#### 3. Frontend Interface
- **Responsive Design**: Mobile-first approach with SportTrack.ai branding
- **Dual Progress Tracking**: Separate progress bars for upload and analysis phases
- **Interactive Parameter Tuning**: Real-time sliders for pose detection fine-tuning
- **Video Comparison**: Side-by-side display of original and analyzed videos

### Key Features

#### Advanced Pose Detection
- **Optimized for Sports**: Tuned specifically for dynamic athletic movements
- **Artifact Reduction**: Temporal consistency checking to reduce false positives
- **Configurable Sensitivity**: User-adjustable parameters for different sports and conditions
- **Real-time Overlay**: Skeletal visualization with customizable colors and styles

#### User Experience
- **Drag & Drop Upload**: Intuitive file upload with format validation
- **Progressive Enhancement**: Works across modern browsers with fallbacks
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance Optimized**: Efficient video processing with H.264 encoding

#### Parameter Tuning Interface
The application includes a sophisticated parameter tuning system allowing users to adjust:

1. **Detection Confidence** (0.1-0.9): How strict the initial pose detection is
2. **Tracking Confidence** (0.1-0.9): How well poses are tracked between frames
3. **Model Complexity** (0-2): Speed vs accuracy trade-off
4. **Landmark Visibility** (0.2-0.8): Minimum confidence for showing body points
5. **Minimum Landmarks** (3-15): Required number of points before showing pose
6. **Stability Ratio** (0.2-0.8): Temporal consistency requirement

## Development Guidelines

### Code Organization
- **Separation of Concerns**: Clear separation between pose processing, web serving, and frontend
- **Modular Design**: Each component can be developed and tested independently
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging**: Detailed logging for debugging and monitoring

### Performance Considerations
- **CPU Optimization**: MediaPipe configured for CPU processing to avoid GPU dependencies
- **Memory Management**: Efficient video frame processing to handle large files
- **Caching**: Static file caching for improved performance
- **Progressive Loading**: Chunked video processing for better user experience

### Security Measures
- **File Validation**: Strict file type and size validation
- **Input Sanitization**: All user inputs are validated and sanitized
- **CORS Headers**: Proper cross-origin resource sharing configuration
- **File Size Limits**: 100MB maximum file size to prevent abuse

## Deployment Configuration

### Vercel Setup
The application is configured for deployment on Vercel with:
- **Serverless Functions**: Flask app runs as serverless function
- **Static File Serving**: Frontend assets served from CDN
- **Environment Variables**: Secure configuration management
- **Auto-scaling**: Handles variable traffic loads

### Environment Variables
```bash
FLASK_ENV=production
MAX_CONTENT_LENGTH=104857600  # 100MB
```

### Package Management
The project supports both traditional pip and modern uv package management:
- **pyproject.toml**: Modern Python project configuration with uv support
- **requirements.txt**: Traditional pip-compatible dependency list
- **uv**: Recommended for faster dependency resolution and installation

## Testing and Quality Assurance

### Testing Strategy
- **Unit Tests**: Core pose processing logic
- **Integration Tests**: End-to-end video processing
- **Browser Testing**: Cross-browser compatibility
- **Performance Testing**: Video processing benchmarks

### Code Quality
- **Type Hints**: Python code includes comprehensive type annotations
- **Documentation**: Inline comments and docstrings
- **Linting**: Code follows PEP 8 standards
- **Error Handling**: Graceful degradation and user feedback

## Future Enhancements

### Planned Features
1. **Multiple Person Detection**: Support for team sports analysis
2. **Sport-Specific Models**: Specialized detection for different sports
3. **Real-time Streaming**: Live video analysis capability
4. **Advanced Analytics**: Detailed biomechanical analysis
5. **Export Functionality**: Video and data export options

### Technical Improvements
1. **WebGL Acceleration**: Client-side pose rendering
2. **WebRTC Integration**: Real-time video streaming
3. **Database Integration**: User data and analysis history
4. **API Expansion**: RESTful API for third-party integrations
5. **Mobile App**: Native mobile applications

## Troubleshooting

### Common Issues
1. **Pose Detection Gaps**: Adjust stability ratio and minimum landmarks
2. **False Positives**: Increase detection confidence and landmark visibility
3. **Performance Issues**: Lower model complexity or video resolution
4. **Upload Failures**: Check file format and size limits

### Parameter Tuning Guide
- **For Fast Sports**: Lower tracking confidence, higher model complexity
- **For Partial Visibility**: Lower minimum landmarks, adjust stability ratio
- **For Accuracy**: Higher detection confidence, maximum model complexity
- **For Speed**: Lower model complexity, higher thresholds

## Contributing

### Development Setup

**Using uv (recommended):**
1. Clone repository
2. Install uv: `pip install uv`
3. Create virtual environment and install dependencies: `uv venv && source .venv/bin/activate && uv sync`
4. Run development server: `python app.py`

**Using pip:**
1. Clone repository
2. Create virtual environment: `python -m venv venv`
3. Install dependencies: `pip install -r requirements.txt`
4. Run development server: `python app.py`

**Note:** The application now runs on port 8000 by default.

### Code Standards
- Follow PEP 8 for Python code
- Use semantic HTML and modern CSS
- Include comprehensive error handling
- Add tests for new features
- Update documentation

## License

This project is proprietary software developed for SportTrack.ai. All rights reserved.

---

**Note**: This application processes video data locally and does not store user content permanently. All uploaded videos are automatically cleaned up after processing.