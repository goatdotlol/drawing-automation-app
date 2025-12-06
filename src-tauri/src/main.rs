// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod drawing_engine;

use tauri::{State, Manager, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState, GlobalShortcutExt};
use drawing_engine::{DrawingEngine, DrawingConfig};
use std::sync::{Arc, atomic::{AtomicBool, Ordering}};
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

#[tauri::command]
async fn start_selection(app: tauri::AppHandle) -> Result<(), String> {
    // Hide main window
    if let Some(main_window) = app.get_webview_window("main") {
        main_window.hide().map_err(|e| e.to_string())?;
    }
    
    // Show overlay window
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.show().map_err(|e| e.to_string())?;
        overlay.set_focus().map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
async fn finish_selection(
    app: tauri::AppHandle,
    x: i32,
    y: i32,
    width: i32,
    height: i32
) -> Result<(), String> {
    // Hide overlay
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.hide().map_err(|e| e.to_string())?;
    }
    
    // Show main window
    if let Some(main_window) = app.get_webview_window("main") {
        main_window.show().map_err(|e| e.to_string())?;
        main_window.set_focus().map_err(|e| e.to_string())?;
    }
    
    // Emit event to main window with coordinates
    app.emit("area-selected", serde_json::json!({
        "x": x,
        "y": y,
        "width": width,
        "height": height
    })).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn cancel_selection(app: tauri::AppHandle) -> Result<(), String> {
    // Hide overlay
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.hide().map_err(|e| e.to_string())?;
    }
    
    // Show main window
    if let Some(main_window) = app.get_webview_window("main") {
        main_window.show().map_err(|e| e.to_string())?;
        main_window.set_focus().map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

fn main() {
    // Create shared stop flag for F8 emergency stop
    let stop_flag = Arc::new(AtomicBool::new(false));
    let engine = Arc::new(DrawingEngine::new(stop_flag.clone()));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(engine)
        .manage(stop_flag.clone())
        .setup(move |app| {
            // Register F8 as global emergency stop
            let app_handle = app.handle().clone();
            let stop_clone = stop_flag.clone();
            
            app.handle()
                .plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, shortcut, event| {
                            if shortcut.matches(Modifiers::empty(), Code::F8) 
                                && event.state == ShortcutState::Pressed {
                                // Set stop flag
                                stop_clone.store(true, Ordering::Relaxed);
                                // Emit event to frontend
                                let _ = app_handle.emit("emergency-stop", ());
                                println!("🚨 EMERGENCY STOP TRIGGERED (F8)");
                            }
                        })
                        .build(),
                )?;

            // Register F8 shortcut
            app.global_shortcut().register("F8")?;
            
            println!("✅ F8 Emergency Stop registered");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            start_drawing,
            stop_drawing,
            pause_drawing,
            get_mouse_position,
            capture_screen,
            start_selection,
            finish_selection,
            cancel_selection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
