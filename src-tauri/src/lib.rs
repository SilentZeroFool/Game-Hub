// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::path::Path;
use std::fs::OpenOptions;
use std::io::Write;

fn append_log(msg: &str) {
  if let Some(mut p) = tauri::api::path::app_config_dir() {
    p.push("game-hub-debug.log");
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(p) {
      let _ = writeln!(f, "{}", msg);
    }
  }
}

#[tauri::command]
fn run_game(path: String) -> Result<(), String> {
  append_log(&format!("run_game called with '{}'", path));
  let p = Path::new(&path);
  if !p.exists() {
    append_log("exe not found");
    return Err(format!("Exe not found: {}", path));
  }
  let dir = p.parent().unwrap_or_else(|| Path::new("."));
  match Command::new(&path).current_dir(dir).spawn() {
    Ok(_) => {
      append_log(&format!("spawned '{}'", path));
      Ok(())
    }
    Err(e) => {
      append_log(&format!("spawn error for '{}': {}", path, e));
      Err(format!("Failed to spawn '{}': {}", path, e))
    }
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![run_game])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
