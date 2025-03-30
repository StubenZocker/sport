# Daily Sport Routine Tracker

A mobile-first web application for tracking daily sport routines. Built with vanilla HTML, CSS, and JavaScript.

## Features

- 📱 Mobile-first design with responsive layout
- 🌙 Dark theme optimized for low-light conditions
- 💾 Fully functional offline with local storage
- 📊 Simple analytics with weekly/monthly views
- ⚙️ Easy data import/export functionality

## Views

1. **Dashboard**: View and manage daily activities
2. **Analytics**: Track performance over time
3. **Add Activity**: Create new activities
4. **Settings**: Manage data and preferences

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- No external dependencies
- Uses localStorage for data persistence
- Responsive design using CSS Flexbox/Grid
- Native touch interactions

## Getting Started

1. Clone this repository
2. Open `index.html` in a modern web browser
3. Start tracking your activities!

## Data Structure

Activities are stored locally with the following structure:
```json
{
  "activities": {
    "activityId": {
      "name": "Activity Name",
      "unit": "unit_type",
      "icon": "emoji_icon",
      "goal": number
    }
  },
  "logs": {
    "YYYY-MM-DD": {
      "activityId": value
    }
  }
}
``` 