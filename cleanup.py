import os
import shutil

def cleanup():
    # Files to delete
    to_delete = [
        r"E:\Carbon-tracker\src\pages\History.tsx",
        r"E:\Carbon-tracker\src\App.tsx",
        r"E:\Carbon-tracker\src\App.tsx.new",
        r"E:\Carbon-tracker\src\App_FINAL.tsx"
    ]
    
    # Files to rename
    src_file = r"E:\Carbon-tracker\src\App_CORRECT.tsx"
    dst_file = r"E:\Carbon-tracker\src\App.tsx"
    
    print("Starting cleanup...")
    print("-" * 50)
    
    # Delete files
    for file_path in to_delete:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"✓ Deleted: {os.path.basename(file_path)}")
            else:
                print(f"⊘ Not found: {os.path.basename(file_path)}")
        except Exception as e:
            print(f"✗ Error deleting {os.path.basename(file_path)}: {str(e)}")
    
    print("-" * 50)
    
    # Copy and rename
    try:
        if os.path.exists(src_file):
            shutil.copy2(src_file, dst_file)
            os.remove(src_file)
            print(f"✓ Renamed: App_CORRECT.tsx → App.tsx")
        else:
            print(f"✗ Source file not found: App_CORRECT.tsx")
    except Exception as e:
        print(f"✗ Error renaming file: {str(e)}")
    
    print("-" * 50)
    print("Cleanup complete!")
    
    # Verify
    print("\nVerification:")
    src_dir = r"E:\Carbon-tracker\src"
    files = os.listdir(src_dir)
    
    if "App.tsx" in files:
        print("✓ App.tsx exists")
    else:
        print("✗ App.tsx missing")
    
    if "History.tsx" not in files and "pages" in files:
        pages_dir = os.path.join(src_dir, "pages")
        if os.path.isdir(pages_dir):
            if "History.tsx" not in os.listdir(pages_dir):
                print("✓ History.tsx deleted")
            else:
                print("✗ History.tsx still exists")
    
    if "App_CORRECT.tsx" not in files:
        print("✓ App_CORRECT.tsx cleaned up")
    else:
        print("✗ App_CORRECT.tsx still exists")
    
    if "App.tsx.new" not in files:
        print("✓ App.tsx.new cleaned up")
    else:
        print("✗ App.tsx.new still exists")
    
    if "App_FINAL.tsx" not in files:
        print("✓ App_FINAL.tsx cleaned up")
    else:
        print("✗ App_FINAL.tsx still exists")

if __name__ == "__main__":
    cleanup()
