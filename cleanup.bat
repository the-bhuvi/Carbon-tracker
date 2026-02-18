@echo off
REM Cleanup script for History page removal and file organization

REM Delete History page component
if exist "E:\Carbon-tracker\src\pages\History.tsx" (
    del "E:\Carbon-tracker\src\pages\History.tsx"
    echo Deleted History.tsx
)

REM Replace App.tsx with corrected version
if exist "E:\Carbon-tracker\src\App_CORRECT.tsx" (
    if exist "E:\Carbon-tracker\src\App.tsx" (
        del "E:\Carbon-tracker\src\App.tsx"
    )
    ren "E:\Carbon-tracker\src\App_CORRECT.tsx" "App.tsx"
    echo Replaced App.tsx
)

REM Delete temporary backup files
if exist "E:\Carbon-tracker\src\App.tsx.new" (
    del "E:\Carbon-tracker\src\App.tsx.new"
    echo Deleted App.tsx.new
)

if exist "E:\Carbon-tracker\src\App_FINAL.tsx" (
    del "E:\Carbon-tracker\src\App_FINAL.tsx"
    echo Deleted App_FINAL.tsx
)

echo Cleanup complete!
pause
