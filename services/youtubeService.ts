import { MediaItem } from '../types';
import { MultimediaService } from './multimediaService';

// This service is now a wrapper around MultimediaService to ensure consistent behavior 
// across the app, using the new Piped API backend.

export const searchYouTube = async (query: string): Promise<MediaItem[]> => {
    return MultimediaService.searchMedia(query);
};

export const getContextualVideos = async (context: string): Promise<MediaItem[]> => {
    return MultimediaService.searchMedia(context + " islamic lecture");
};
