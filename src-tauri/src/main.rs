// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod drawing_engine;

use tauri::State;
use drawing_engine::{DrawingEngine, DrawingConfig};
use std::sync::Arc;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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
            pause_drawing
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
