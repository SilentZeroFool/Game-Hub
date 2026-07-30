// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::path::Path;
use std::fs::{OpenOptions, create_dir_all};
use std::io::Write;
use std::env;

fn append_log_to(path: &Path, msg: &str) {
  if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(path) {
    let _ = writeln!(f, "{}", msg);
  }
}

fn append_log(msg: &str) {
  // Try app config dir (previous behavior)
  if let Some(mut p) = tauri::api::path::app_config_dir() {
    p.push("game-hub-debug.log");
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(&p) {
      let _ = writeln!(f, "{}", msg);
      return;
    }
  }

  // Fallback: write to LOCALAPPDATA\GameHub\game-hub-debug.log so artifact testers can find it easily
  if let Ok(local) = env::var("LOCALAPPDATA") {
    let mut p = Path::new(&local).join("GameHub");
    let _ = create_dir_all(&p);
    p.push("game-hub-debug.log");
    append_log_to(&p, msg);
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

#[tauri::command]
fn write_renderer_log(msg: String) -> Result<(), String> {
  append_log(&format!("[renderer] {}", msg));
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![run_game, write_renderer_log])
    .setup(|app| {
      // Write a startup log line so artifact-only testers can see the app launch
      append_log("app setup");
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
