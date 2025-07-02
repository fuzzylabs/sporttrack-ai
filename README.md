# SportTrack.ai 🏃‍♂️

> **AI-Powered Sports Technique Analysis with Real-Time Pose Detection**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/sporttrack-ai)

SportTrack.ai is a cutting-edge web application that analyzes sports performance videos using advanced AI pose detection. Upload a video of athletic performance and receive instant feedback with skeletal overlay visualization and technique analysis.

## ✨ Features

### 🎯 **Core Functionality**
- **33-Point Pose Detection**: Advanced MediaPipe AI tracks every major body landmark
- **Real-Time Video Overlay**: Skeletal connections drawn on original video frames
- **Side-by-Side Comparison**: View original and analyzed videos simultaneously
- **Interactive Parameter Tuning**: Fine-tune detection settings for optimal results
- **British English Interface**: Localised for UK/EU users

### 🔧 **Advanced Controls**
- **Adjustable Detection Sensitivity**: Control how picky the AI is about pose detection
- **Movement Tracking Options**: Optimise for fast movements vs stability
- **Processing Speed vs Accuracy**: Choose based on your needs and hardware
- **Troubleshooting Tips**: Built-in guidance for common issues

### 🎨 **User Experience**
- **SportTrack.ai Branding**: Official yellow colour scheme and logo
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Drag & Drop Upload**: Intuitive file upload with progress tracking
- **Progressive Enhancement**: Graceful degradation for older browsers

## 🚀 Quick Start

### One-Click Deployment
Deploy to Vercel with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/sporttrack-ai)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/sporttrack-ai.git
   cd sporttrack-ai
   ```

2. **Quick start**:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

3. **Open your browser**: Navigate to `http://localhost:5000`

### Manual Installation

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run application
python3 app.py
```

## 📹 How It Works

1. **📤 Upload**: Drag and drop your sports video (MP4, AVI, MOV, MKV)
2. **🤖 AI Analysis**: MediaPipe processes each frame to detect body landmarks
3. **🎨 Visualisation**: Skeletal overlay applied with green landmarks and red connections
4. **📊 Metrics**: Real-time confidence scores and technique analysis
5. **🔧 Tuning**: Adjust parameters based on your specific sport and conditions

## 🏆 Use Cases

| Use Case | Description | Benefits |
|----------|-------------|----------|
| **Sports Coaching** | Analyze athlete technique frame-by-frame | Objective feedback, identify improvement areas |
| **Self-Training** | Review your own performance | Track progress, perfect technique |
| **Biomechanics Research** | Study human movement patterns | Quantitative analysis, research data |
| **Injury Prevention** | Identify improper form | Reduce injury risk, improve safety |
| **Performance Analysis** | Compare techniques over time | Measure improvement, optimize training |

## 🔧 Parameter Tuning Guide

The application includes an advanced parameter tuning interface with user-friendly explanations:

### Key Parameters

| Parameter | What It Does | When to Adjust |
|-----------|--------------|----------------|
| **Detection Sensitivity** | How easily the AI finds your body | Lower for difficult lighting/angles |
| **Movement Tracking** | How well it follows fast movement | Lower for rapid sports like tennis |
| **Processing Speed** | Accuracy vs performance trade-off | Higher for detailed analysis |
| **Landmark Clarity** | How clear body points must be | Lower when partially obscured |
| **Pose Completeness** | How many points needed for valid pose | Lower for partial visibility |
| **Stability Requirement** | How consistent poses must be over time | Lower for quicker detection |

### 💡 Quick Fixes

- **Poses appearing too late?** → Lower "Stability Requirement" and "Pose Completeness"
- **Too many false poses?** → Increase "Detection Sensitivity" and "Landmark Clarity"
- **Losing tracking during fast movement?** → Lower "Movement Tracking"
- **Need more detail?** → Set "Processing Speed" to "Slow but very accurate"

## 🛠 Technology Stack

### Backend
- **Python 3.9+** with Flask web framework
- **MediaPipe** for AI pose detection (33 landmarks)
- **OpenCV** for video processing and overlay generation
- **NumPy** for numerical computations

### Frontend
- **HTML5** with semantic markup
- **CSS3** with custom properties and grid layouts
- **Vanilla JavaScript** for interactions and real-time updates
- **Responsive Design** with mobile-first approach

### Deployment
- **Vercel** serverless functions
- **H.264** video encoding for browser compatibility
- **Progressive Enhancement** for accessibility

## 📁 Project Structure

```
sporttrack-ai/
├── 🐍 Backend
│   ├── app.py                    # Flask web application
│   ├── pose_processor.py         # MediaPipe pose detection engine
│   └── requirements.txt          # Python dependencies
├── 🎨 Frontend
│   ├── templates/index.html      # Main web interface
│   ├── static/css/style.css      # SportTrack.ai styling
│   ├── static/js/main.js         # Frontend interactions
│   └── static/Asset-3@4x.png     # Official SportTrack.ai logo
├── 📁 Storage
│   ├── static/uploads/           # Uploaded video storage
│   └── static/processed/         # Processed video output
├── 🚀 Deployment
│   ├── start.sh                  # Quick startup script
│   ├── vercel.json              # Vercel configuration
│   └── .gitignore               # Git ignore rules
└── 📚 Documentation
    ├── README.md                # This file
    └── CLAUDE.md                # Development documentation
```

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Full Support |
| Firefox | 75+ | ✅ Full Support |
| Safari | 13+ | ✅ Full Support |
| Edge | 80+ | ✅ Full Support |

## ⚡ Performance

- **CPU-Optimised**: No GPU dependencies, runs on any modern computer
- **Real-Time Processing**: 30+ FPS pose detection
- **Efficient Encoding**: H.264 compression for smaller file sizes
- **Progressive Loading**: Handles large video files gracefully

## 🤝 Contributing

We welcome contributions! Please see our [development documentation](CLAUDE.md) for detailed information about:

- Development setup and guidelines
- Code standards and testing
- Architecture and design decisions
- Future enhancement plans

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `pip install -r requirements.txt`
4. Make your changes and add tests
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is proprietary software developed for SportTrack.ai. All rights reserved.

## 🔒 Privacy & Security

- **Local Processing**: Videos processed locally, not stored permanently
- **No Data Collection**: No personal information collected or stored
- **Secure Upload**: File validation and size limits prevent abuse
- **Auto Cleanup**: Temporary files automatically removed after processing

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/sporttrack-ai/issues)
- **Documentation**: [CLAUDE.md](CLAUDE.md)
- **Website**: [SportTrack.ai](https://sporttrack.ai)

---

<div align="center">

**SportTrack.ai** - Revolutionising sports technique analysis with AI

[🌐 Website](https://sporttrack.ai) • [📖 Docs](CLAUDE.md) • [🚀 Deploy](https://vercel.com/new/clone?repository-url=https://github.com/your-username/sporttrack-ai)

Made with ❤️ for athletes and coaches worldwide

</div>