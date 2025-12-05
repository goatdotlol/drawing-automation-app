use device_query::{DeviceQuery, DeviceState};
use tauri::command;
use screenshots::Screen;
use base64::{Engine as _, engine::general_purpose};
use std::io::Cursor;
use image::ImageFormat;

#[command]
fn get_mouse_position() -> (i32, i32) {
    let device_state = DeviceState::new();
    let mouse = device_state.get_mouse();
    mouse.coords
}

#[command]
fn capture_screen() -> Result<String, String> {
    let screens = Screen::all().map_err(|e| e.to_string())?;
    
    // For now, let's just capture the primary screen (usually the first one)
    // In a multi-monitor setup, this might need refinement, but it's a good start.
    let screen = screens.first().ok_or("No screens found")?;
    
    let image = screen.capture().map_err(|e| e.to_string())?;
    
    // Convert RgbaImage to PNG bytes in memory
    let mut buffer = Cursor::new(Vec::new());
    image.write_to(&mut buffer, ImageFormat::Png).map_err(|e| e.to_string())?;
    
    let encoded = general_purpose::STANDARD.encode(buffer.into_inner());
    Ok(format!("data:image/png;base64,{}", encoded))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_mouse_position, capture_screen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
