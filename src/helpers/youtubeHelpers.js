import GoogleAuth from './googleAuth';
import axios from 'axios';

export default async function loadLikedVideos() {
    const token = GoogleAuth.getCurrentUserToken();
    const url = "https://www.googleapis.com/youtube/v3/videos";
    
    const response = axios({
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
            'myRating': 'like',
            'part': 'snippet',
            'maxResults': '48',
        },
        url,
    })

    return (await response).data.items.map((item) => {
        return {
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.standard ? item.snippet.thumbnails.standard: item.snippet.thumbnails.default,
            url: `https://www.youtube.com/watch?v=${item.id}`
        }
    });
}