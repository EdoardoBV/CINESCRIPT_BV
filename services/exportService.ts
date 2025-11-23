import { Project } from '../types';

/**
 * Exports project shot data to CSV format
 */
export const exportProjectToCSV = (project: Project): void => {
    // CSV Headers
    const headers = [
        'Scene',
        'Shot #',
        'Size',
        'Angle',
        'Movement',
        'Framing',
        'Focus',
        'Description',
        'Lens',
        'Camera',
        'Aperture',
        'FPS',
        'Resolution',
        'Color Temp',
        'Timecode',
        'Takes',
        'Status',
        'AD Notes',
        'Production Notes'
    ];

    // Build CSV rows
    const rows: string[][] = [];

    project.scenes.forEach(scene => {
        scene.shots.forEach(shot => {
            rows.push([
                `${scene.number} - ${scene.title}`,
                shot.number.toString(),
                shot.size,
                shot.angle,
                shot.movement,
                shot.framing,
                shot.focus,
                shot.description || '',
                shot.lens || '',
                shot.camera || '',
                shot.aperture || '',
                shot.fps?.toString() || '',
                shot.resolution || '',
                shot.colorTemp || '',
                shot.timecode || '',
                shot.takes?.toString() || '',
                shot.status || '',
                shot.adNotes || '',
                shot.notes || ''
            ]);
        });
    });

    // Convert to CSV string
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `${project.name.replace(/[^a-z0-9]/gi, '_')}_shot_chart_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
