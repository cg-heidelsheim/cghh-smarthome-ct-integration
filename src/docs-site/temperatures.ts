import * as fs from 'fs';
import * as path from 'path';

import {escapeHtml} from './layout';

interface RoomConfigEntry {
    name: string;
    desiredTemperature: number;
    desiredTemperatureIdle: number;
}

interface EventRoomConfigEntry {
    id: string;
    desiredTemperature: number;
    comment?: string;
}

const readJsonMap = <T>(file: string): Record<string, T> | null => {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, T>;
    } catch {
        return null;
    }
};

const missingConfigNotice = (file: string): string => `
<div class="callout callout-note" data-callout-label="ℹ️ Hinweis">
<p>Die Konfigurationsdatei <code>${escapeHtml(file)}</code> wurde auf diesem Server (noch) nicht gefunden
oder konnte nicht gelesen werden - vermutlich ist dieser Bereich noch nicht eingerichtet. Wende dich an
die <a href="/docs/technik/komponenten">Betreuung des Systems</a>.</p>
</div>`;

const renderRoomTable = (rooms: Record<string, RoomConfigEntry>): string => {
    const rows = Object.values(rooms)
        .sort((a, b) => a.name.localeCompare(b.name, 'de'))
        .map((room) => `<tr><td>${escapeHtml(room.name)}</td><td>${room.desiredTemperature} °C</td><td>${room.desiredTemperatureIdle} °C</td></tr>`)
        .join('\n');

    return `
<table>
<thead><tr><th>Raum</th><th>Zieltemperatur bei einem Termin</th><th>Grundtemperatur (ohne Termin)</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`;
};

const renderEventOverrideTable = (overrides: Record<string, EventRoomConfigEntry>): string => {
    const entries = Object.values(overrides);
    if (entries.length === 0) {
        return '<p><em>Aktuell sind keine abweichenden Termin-Zieltemperaturen hinterlegt.</em></p>';
    }

    const rows = entries
        .sort((a, b) => a.id.localeCompare(b.id, 'de'))
        .map((entry) => `<tr><td>${escapeHtml(entry.id)}</td><td>${entry.desiredTemperature} °C</td><td>${escapeHtml(entry.comment ?? '')}</td></tr>`)
        .join('\n');

    return `
<table>
<thead><tr><th>Termin-Stichwort</th><th>Zieltemperatur</th><th>Kommentar</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`;
};

/**
 * Built fresh on every request (no caching) from config/room.config.json and
 * config/event-room-temperature.config.json - unlike the rest of the site, this content is
 * config, not code, and can change on the server without a redeploy, so it's read live.
 */
export const renderTemperaturesBody = (): string => {
    const roomConfigFile = path.join(process.cwd(), 'config/room.config.json');
    const eventConfigFile = path.join(process.cwd(), 'config/event-room-temperature.config.json');

    const rooms = readJsonMap<RoomConfigEntry>(roomConfigFile);
    const eventOverrides = readJsonMap<EventRoomConfigEntry>(eventConfigFile);

    return `
<h1>Zieltemperaturen</h1>
<p>Diese Seite liest die aktuell auf dem Server hinterlegte Konfiguration direkt aus und zeigt sie hier
an - sie ist also immer aktuell, auch wenn sich die Konfiguration ändert, ohne dass diese Doku-Seite
selbst angepasst wird.</p>

<h2>Je Raum</h2>
<p>Das ist die Temperatur, auf die ein Raum für einen normalen gebuchten Termin geheizt wird, und die
Grundtemperatur, auf die er ohne Termin gehalten wird.</p>
${rooms ? renderRoomTable(rooms) : missingConfigNotice('config/room.config.json')}

<h2>Abweichungen je Termin</h2>
<p>Für manche Termine gilt statt der raumüblichen Zieltemperatur ein eigener Wert - unabhängig davon, in
welchem Raum der Termin stattfindet. Ein Termin bekommt diesen Wert, wenn sein Name das folgende
Stichwort enthält (Groß-/Kleinschreibung spielt keine Rolle).</p>
${eventOverrides ? renderEventOverrideTable(eventOverrides) : missingConfigNotice('config/event-room-temperature.config.json')}
`;
};
