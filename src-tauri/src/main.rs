// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod drawing_engine;

use tauri::State;
use drawing_engine::{DrawingEngine, DrawingConfig};
use std::sync::Arc;
use device_query::{DeviceQuery, DeviceState};
use screenshots::Screen;
use base64::{Engine as _, engine::general_purpose};
use std::io::Cursor;
use image::ImageFormat;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_mouse_position() -> (i32, i32) {
    let device_state = DeviceState::new();
    let mouse = device_state.get_mouse();
    mouse.coords
}

#[tauri::command]
fn capture_screen() -> Result<String, String> {
    let screens = Screen::all().map_err(|e| e.to_string())?;
    // Capture primary screen
    let screen = screens.first().ok_or("No screens found")?;
    let image = screen.capture().map_err(|e| e.to_string())?;
    
    // Convert to RgbaImage from raw bytes
    let buffer = image.rgba();
    let width = image.width();
    let height = image.height();
    
    let img = image::RgbaImage::from_raw(width, height, buffer.to_vec())
        .ok_or("Failed to create image from capture")?;
        
    let mut cursor = Cursor::new(Vec::new());
    img.write_to(&mut cursor, ImageFormat::Png).map_err(|e| e.to_string())?;
    
    let encoded = general_purpose::STANDARD.encode(cursor.into_inner());
    Ok(format!("data:image/png;base64,{}", encoded))
}

#[tauri::command]
fn start_drawing(
    engine: State<'_, Arc<DrawingEngine>>,
    image_path: String,
    speed: u64,
    method: String,
    width: u32,
    height: u32,
    x: i32,
    y: i32,
) {
    let config = DrawingConfig {
        speed,
        method,
        width,
        height,
        x,
        y,
    };
    engine.start(image_path, config);
}

#[tauri::command]
fn stop_drawing(engine: State<'_, Arc<DrawingEngine>>) {
    engine.stop();
}

#[tauri::command]
fn pause_drawing(engine: State<'_, Arc<DrawingEngine>>) {
    engine.pause();
}

fn main() {
    let engine = Arc::new(DrawingEngine::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(engine)
        .invoke_handler(tauri::generate_handler![
            greet,
            start_drawing,
            stop_drawing,
            pause_drawing,
            get_mouse_position,
            capture_screen
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
