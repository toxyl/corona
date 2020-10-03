# Covid-19 Info

Watch it live: https://www.webcodesign.de/corona

## Data Source
The data displayed is retrieved using the [Coronavirus Tracker API v2](https://github.com/ExpDev07/coronavirus-tracker-api).

## Filtering
You can filter the overview by country names and/or country codes. 
Multiple search terms should be separated with commas. 
Country codes should be wrapped in square brackets. 

### Examples
- `Neth,Erman` will show `*Neth*erlands [NL]` and `G*erman*y [DE]`
- `[NL],Erman` will show `Netherlands *[NL]*` and `G*erman*y [DE]`
- `[Z` will show `South Africa *[Z*A]`, `Zambia *[Z*M]` and `Zimbabwe *[Z*W]` 

## Sorting
The overview can be sorted by any of these stats:
- population
- confirmed (current)
- confirmed (last)
- confirmed (change since last in %)
- deaths (current)
- deaths (last)
- deaths (change since last in %)
- case fatality rate (in %)
- infection chance (1 person met)
- infection chance (10 persons met)
- infection chance (50 persons met)
- infection chance (100 persons met)

## Totals
The filtered results are consolidated in a "totals" row for convenience. 

## Highlighting
For further convenience most cells are highlighted according to four categories, see the following table for the thresholds used:

| Stat | zero (no color) | low (yellow) | medium (orange) | high (red) 
| --- | --- | --- | --- | ---
| population | - | - | - | -
| confirmed (current) | <100 | 100 | 1000 | 10000
| confirmed (last) | <100 | 100 | 1000 | 10000
| confirmed (change since last in %) | <1 | 1 | 25 | 50
| deaths (current) | <100 | 100 | 1000 | 10000
| deaths (last) | <100 | 100 | 1000 | 10000
| deaths (change since last in %) | <1 | 1 | 25 | 50
| case fatality rate (in %) | <1 | 1 | 10 | 25
| infection chance (1 person met) | <1 | 1 | 25 | 50
| infection chance (10 persons met) | <1 | 1 | 25 | 50
| infection chance (50 persons met) | <1 | 1 | 25 | 50
| infection chance (100 persons met) | <1 | 1 | 25 | 50

## Configuration
Edit `js/Config.js` to change the default settings (columns, highlighting thresholds, cell value calculations, country aliases, API URL, update interval).

## Icon
The favicon is made from [Somewans Covid-19 Coronavirus icon set](https://www.iconfinder.com/iconsets/covid-19-coronavirus).
