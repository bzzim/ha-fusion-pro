# Changelog FUSION pro

## [0.0.4] - 2024-06-19

## Sync original repo

### Fixed

- Update youtube addon

## [0.0.3] - 2024-06-17

### Added

- Read-only selection. Disable search input in mode selection
- LightModal: support effects
- GraphConfig:
  - RangeSlider instead input for change size
  - Selecting a period using buttons instead of entering a search
- HistoryConfig:
  - The Option hide value indicator
  - Selecting a period using buttons instead of entering a search-
- History:
  - The Option hide value indicator
  - Highlight current period on hover
- Sidebar: hover outline in edit mode

### Remove

- Select: navigation by keyboard
- Modal: close by drag
- GraphConfig: unused date fields

### Fixed

- Camera: max width
- WeatherForecast: wrap days
- UpdateModal: fix style and hide buttons if installed latest
- LightModal: replace the power switch with a button switch
- Horizontal stack: responsive
- History: display history if there is fewer data for the selected period
- AlarmControlPanelModal
  - Current state as buttons
  - Show the code panel when device required code
- Modal
  - Touch scroll
  - Action buttons for mobile view
  - Less empty spaces for mobile view
  - Sticky action button in edit mode
  - Styled scrollbar

## [0.0.2] - 2024-06-15

### Added

- UniversalSelect component: show icon buttons or dropdown list when states have more than six items.
- Vacuum: Fan speed modes
- Climate: WheelPicker replaces to SlidePicker component for set temperature
- WheelPicker component: live update

### Remove

- Climate: WheelPicker component for set temperature

### Fixed

- Vacuum: State and battery display in one line with icon
- WheelPicker component: bugs
- Small style fixes
- Refactoring

## [0.0.1] - 2024-06-11

### Added

- Customized date component
- Setting for visibility sidebar and navigate
- Climate
  - New modes with icons
  - Support preset modes

### Fixed

- WheelPicker and Select: fix icons on phone
- Climate: not showing temperature list if min temp=0
- Convert translations from ASCII to UTF
- Small style fixes
- Update deps
