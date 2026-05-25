# Energy Equipment Monitoring Dashboard

A React dashboard that simulates monitoring power generation equipment using sensor data, health status logic, risk scoring, and maintenance recommendations.

## Overview

This project explores how software and data visualization can support equipment reliability in a power generation environment. The dashboard tracks simulated sensor readings for assets such as pumps, turbines, generators, and valves, then classifies each asset as Healthy, Warning, or Critical based on operating conditions.

## Why I Built This

I built this project to create a practical operations focused tool related to energy infrastructure. The goal was to show how raw equipment data can be turned into a clear interface that helps teams monitor asset health, identify abnormal trends, and prioritize maintenance decisions.

## Features

- Simulated sensor data for power generation equipment
- Temperature, vibration, output, and efficiency tracking
- Health classification for each asset
- Risk score calculation from sensor readings
- Maintenance recommendations based on equipment status
- Fleet level KPI cards
- Sensor trend line chart
- Risk by asset bar chart
- Operational alert queue
- Equipment summary table

## Tech Stack

- React
- Vite
- Recharts
- Tailwind CSS
- JavaScript

## How It Works

The app starts with a mock equipment dataset. Each asset has baseline readings for temperature, vibration, output, and efficiency.

The dashboard then:

1. Generates simulated time series sensor readings
2. Applies rule based anomaly detection
3. Classifies equipment health as Healthy, Warning, or Critical
4. Calculates a risk score from sensor values
5. Displays the results through charts, KPI cards, alerts, and tables
6. Provides maintenance recommendations based on the asset status

## Project Architecture

```text
Equipment Baseline Data
↓
Simulated Sensor Readings
↓
Status Classification
↓
Risk Score Calculation
↓
Dashboard Visualization
↓
Maintenance Recommendation

## How To Run Locally

npm install
npm run dev

then open: http://localhost:5173/





