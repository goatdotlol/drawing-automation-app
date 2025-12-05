# SawBot - Drawing Automation Tool

**SawBot** is a powerful, high-performance desktop application for automating drawing on digital canvases. Built with Tauri v2, React, and Rust, it combines a beautiful modern UI with sophisticated algorithm implementations for precise pixel-by-pixel drawing automation.

---

## ✨ Features

### 🎨 **Advanced Drawing Methods**
Choose from 6 sophisticated drawing algorithms, each optimized for different use cases:
- **Matrix Dot**: Fast scanning with dot placement (ideal for high-contrast images)
- **Floyd-Steinberg Dithering**: Error diffusion for realistic shading and gradients
- **Continuous Line**: Single elegant line drawing for artistic results
- **Spiral Raster**: Center-outward spiral pattern
- **Stippling**: Variable dot density for natural shading
- **Contour/Vector**: Traces outlines and fills shapes

### ⚡ **Customizable Speed Controls**
- Adjustable speed for **every drawing method** with both slider and manual input
- Persistent speed settings per method
- Sensible min/max limits optimized for each algorithm

### 🎨 **Theming System**
Choose from 6 beautiful themes:
- **Classic Dark** - Professional dark mode
- **Clean Light** - Bright and modern
- **Cyberpunk** - Neon fuchsia and deep blacks
- **Sunset Drive** - Warm oranges and purples
- **Deep Forest** - Natural greens
- **Starry Night** - Indigo and blues

All theme changes apply instantly across the entire UI.

### 📐 **Flexible Area Selection**
Multiple methods to define your drawing canvas:
1. **Screenshot & Select**: Capture your screen, then drag to select the exact area (app hides during capture for accuracy)
2. **Manual Input**: Enter precise X, Y coordinates and dimensions
3. **Overlay Tool**: Snipping-tool style overlay for visual selection

### 🖼️ **Smart Image Handling**
- Drag-and-drop or browse to upload
- Automatic image processing and optimization
- Real-time preview

### 🎚️ **Window Management**
- **Mini Mode**: Compact player view for unobtrusive operation
- **Always on Top**: Pin the window for easy monitoring
- Resizable and draggable interface
- Smooth animations and transitions

### 🐛 **Debug Console** (F10)
- Toggle with F10 key
- Real-time logging from frontend and backend
- Color-coded log levels (info, warn, error, debug)
- Timestamp tracking

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **Rust** (latest stable)
- **npm** or **pnpm**

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/sawbot.git
cd sawbot/drawing-automation-app

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

The built application will be in `src-tauri/target/release/`.

---

## 📖 How to Use

### 1. **Select an Image**
   - Drag and drop an image onto the drop zone
   - OR click to browse your file system

### 2. **Define Drawing Area**
   - Click **"Capture Screen & Select Area"** to take a screenshot and select visually
   - OR manually enter coordinates (X, Y, Width, Height)

### 3. **Choose Drawing Method**
   - Select from 6 available algorithms
   - Adjust speed using the slider or input field below the method selector
   - Speed settings are saved and remembered per method

### 4. **Start Drawing**
   - Click **"Start Drawing"** in the Status panel
   - Monitor progress in the debug console (F10)
   - Click **"Stop Drawing"** to cancel at any time

### 5. **Customize Your Experience**
   - Navigate to **Settings** to change themes
   - Use **Mini Mode** for a compact view
   - Toggle **Always on Top** as needed

---

## 🛠️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Rust, Tauri v2
- **State Management**: Zustand (with localStorage persistence)
- **UI Components**: Custom components with lucide-react icons

### Project Structure
```
drawing-automation-app/
├── src/                      # React frontend
│   ├── components/
│   │   ├── debug/           # Debug console
│   │   ├── layout/          # Header, Sidebar, MiniPlayer
│   │   ├── overlay/         # Screenshot modal
│   │   ├── pages/           # Settings, History
│   │   ├── settings/        # Drawing method selector
│   │   ├── ui/              # Reusable UI components
│   │   └── upload/          # File upload components
│   ├── hooks/               # useTheme
│   ├── lib/                 # themes.ts
│   ├── stores/              # Zustand stores (settings, logs)
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── drawing_engine.rs  # Core drawing logic
│   │   └── main.rs           # Tauri commands
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

### Key Dependencies
**Frontend:**
- `@tauri-apps/api` - Tauri API bindings
- `zustand` - State management
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling

**Backend:**
- `tauri` - Framework
- `image` - Image processing
- `enigo` - Mouse automation
- `screenshots` - Screen capture
- `fast_image_resize` - Performance optimization

---

## 🎨 Customization

### Adding a New Theme
1. Edit `src/lib/themes.ts`
2. Add your theme definition:
```typescript
newtheme: {
    id: 'newtheme',
    name: 'My Theme',
    colors: {
        background: '#...',
        surface: '#...',
        primary: '#...',
        // ... etc
    }
}
```
3. Update the `ThemeId` type
4. Theme will appear automatically in Settings

### Adding a Drawing Method
1. Implement the algorithm in `src-tauri/src/drawing_engine.rs`
2. Add the method to `src/components/settings/DrawingMethodSelector.tsx`
3. Define default/min/max speeds
4. The speed control will automatically integrate

---

## 🐛 Troubleshooting

### "Command not found" errors
- Ensure `npm run tauri dev` builds successfully
- Commands are registered in `src-tauri/src/main.rs`

### Window won't resize
- Check `tauri.conf.json` window configuration
- Ensure permissions are set in `src-tauri/capabilities/default.json`

### Screenshot capture fails
- Verify `screenshots` crate is installed
- Check screen permissions on macOS/Linux

### Theme not updating
- Clear localStorage: `localStorage.clear()` in browser console during dev
- Restart the application

---

## 📝 Development

### Adding New Features
1. Plan your feature in `implementation_plan.md`
2. Update `task.md` with specific subtasks
3. Implement and test
4. Update `walkthrough.md` with proof of work

### Code Style
- Use **Tailwind CSS** for styling
- Keep components focused and reusable
- Use Zustand for persistent state
- Follow TypeScript best practices

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/)
- UI inspired by modern design systems
- Drawing algorithms based on classic computer graphics techniques

---

**Made with ❤️ for the drawing automation community**
