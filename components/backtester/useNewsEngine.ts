import { useState, useEffect } from "react";
import { NewsEvent } from "./types";

const EVENTS = [
    { title: "CPI Data Release", impact: "high" },
    { title: "NFP Report", impact: "high" },
    { title: "FOMC Statement", impact: "high" },
    { title: "Retail Sales", impact: "medium" },
    { title: "Unemployment Claims", impact: "medium" },
    { title: "Bond Auction", impact: "low" },
    { title: "Trade Balance", impact: "medium" }
];

export const useNewsEngine = (currentTime: number) => {
    const [events, setEvents] = useState<NewsEvent[]>([]);

    useEffect(() => {
        // Generate mock news for the next 30 days if empty
        if (events.length === 0) {
           const newEvents: NewsEvent[] = [];
           // Start from 2023-01-01 (mock start)
           let time = new Date("2023-01-01").getTime() / 1000;
           const endTime = time + (30 * 24 * 3600); // 30 days
           
           while(time < endTime) {
               // Random event every 4-8 hours
               time += (4 + Math.random() * 4) * 3600; 
               
               const template = EVENTS[Math.floor(Math.random() * EVENTS.length)];
               newEvents.push({
                   id: Math.random().toString(36).substr(2, 9),
                   time: Math.floor(time),
                   title: template.title,
                   impact: template.impact as any,
                   currency: "USD",
                   forecast: (Math.random() * 5).toFixed(1) + "%",
                   actual: (Math.random() * 5).toFixed(1) + "%"
               });
           }
           setEvents(newEvents);
        }
    }, []);

    // Filter relevant events (e.g. past 2 days and future 1 day relative to currentTime)
    // For now, return all sorted by time
    const visibleEvents = events.filter(e => Math.abs(e.time - currentTime) < 3 * 24 * 3600).sort((a,b) => b.time - a.time);
    
    return {
        events: visibleEvents
    };
};
