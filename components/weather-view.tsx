"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface WeatherData {
  location: string;
  temperature: number;
  unit: string;
  windspeed: number;
  condition: number;
}

const WEATHER_CODE_MAP: Record<number, { label: string; icon: string; color: string }> = {
  0: { label: "Clear sky", icon: "fa-sun", color: "text-yellow-400" },
  1: { label: "Mainly clear", icon: "fa-cloud-sun", color: "text-yellow-200" },
  2: { label: "Partly cloudy", icon: "fa-cloud", color: "text-gray-400" },
  3: { label: "Overcast", icon: "fa-cloud", color: "text-gray-500" },
  45: { label: "Fog", icon: "fa-smog", color: "text-gray-300" },
  48: { label: "Depositing rime fog", icon: "fa-smog", color: "text-gray-300" },
  51: { label: "Light drizzle", icon: "fa-cloud-rain", color: "text-blue-300" },
  53: { label: "Moderate drizzle", icon: "fa-cloud-rain", color: "text-blue-400" },
  55: { label: "Dense drizzle", icon: "fa-cloud-rain", color: "text-blue-500" },
  56: { label: "Light freezing drizzle", icon: "fa-cloud-meatball", color: "text-blue-200" },
  57: { label: "Dense freezing drizzle", icon: "fa-cloud-meatball", color: "text-blue-300" },
  61: { label: "Slight rain", icon: "fa-cloud-showers-heavy", color: "text-blue-400" },
  63: { label: "Moderate rain", icon: "fa-cloud-showers-heavy", color: "text-blue-500" },
  65: { label: "Heavy rain", icon: "fa-cloud-showers-heavy", color: "text-blue-600" },
  66: { label: "Light freezing rain", icon: "fa-cloud-meatball", color: "text-blue-200" },
  67: { label: "Heavy freezing rain", icon: "fa-cloud-meatball", color: "text-blue-300" },
  71: { label: "Slight snow fall", icon: "fa-snowflake", color: "text-white" },
  73: { label: "Moderate snow fall", icon: "fa-snowflake", color: "text-white" },
  75: { label: "Heavy snow fall", icon: "fa-snowflake", color: "text-white" },
  77: { label: "Snow grains", icon: "fa-snowflake", color: "text-white" },
  80: { label: "Slight rain showers", icon: "fa-cloud-showers-water", color: "text-blue-400" },
  81: { label: "Moderate rain showers", icon: "fa-cloud-showers-water", color: "text-blue-500" },
  82: { label: "Violent rain showers", icon: "fa-cloud-showers-water", color: "text-blue-600" },
  85: { label: "Slight snow showers", icon: "fa-snowflake", color: "text-white" },
  86: { label: "Heavy snow showers", icon: "fa-snowflake", color: "text-white" },
  95: { label: "Thunderstorm", icon: "fa-cloud-bolt", color: "text-yellow-500" },
  96: { label: "Thunderstorm with slight hail", icon: "fa-cloud-bolt", color: "text-yellow-600" },
  99: { label: "Thunderstorm with heavy hail", icon: "fa-cloud-bolt", color: "text-yellow-700" },
};

export default function WeatherView({ data }: { data: WeatherData }) {
  const condition = WEATHER_CODE_MAP[data.condition] || {
    label: "Unknown",
    icon: "fa-question",
    color: "text-gray-400",
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg max-w-sm animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{data.location}</h3>
          <p className="text-sm text-muted-foreground">{condition.label}</p>
        </div>
        <i className={cn("fa-solid fa-3x", condition.icon, condition.color)}></i>
      </div>
      
      <div className="flex items-end gap-2 mb-6">
        <i className={cn("fa-solid fa-temperature-half text-2xl mb-2", condition.color)}></i>
        <span className="text-5xl font-black tracking-tighter text-foreground">
          {Math.round(data.temperature)}°
        </span>
        <span className="text-xl font-medium text-muted-foreground mb-1 uppercase">
          {data.unit === "celsius" ? "C" : "F"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-wind text-muted-foreground"></i>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Wind</span>
            <span className="text-sm font-medium">{data.windspeed} km/h</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-droplet text-muted-foreground"></i>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Condition</span>
            <span className="text-sm font-medium">{condition.label.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
