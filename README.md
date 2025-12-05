# SawBot

A lightweight, high-performance desktop drawing automation application built with Tauri, React, and Rust.

## Features

- **High Performance**: Built with Rust and Tauri for minimal resource usage.
- **Slick UI**: Discord-inspired design with smooth animations.
- **Multiple Drawing Algorithms**: Matrix Dot, Floyd-Steinberg Dithering, Continuous Line, etc.
- **Cross-Platform**: Windows, macOS, and Linux support.

## Building

This project is set up to be built using GitHub Actions.

1. Push this repository to GitHub.
2. Go to the "Actions" tab.
3. The "Publish" workflow will automatically run on push to `release` branch.
4. Download the executable from the Releases page.

## Development

If you have Node.js and Rust installed:

```bash
npm install
npm run tauri dev
```
