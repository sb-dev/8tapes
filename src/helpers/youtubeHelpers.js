import GoogleAuth from './googleAuth';
import axios from 'axios';
import config from '../config';
import topicDetails from './topicDetails'

const pageLimit = config.googleServices.services.youtube.QUERY_LIMIT;

const categoriseVideos = (dataList) => {    
    const map = {};
    const processedItems = {};
    
    dataList.forEach(element => {
        element.items.forEach((item) => {
            if (item.topicDetails && item.topicDetails.relevantTopicIds) {
                item.topicDetails.relevantTopicIds.forEach((topicId) => {
                    if (topicDetails[topicId] && topicDetails[topicId].includes('parent topic')) {
                        const label = topicDetails[topicId].replace(' (parent topic)', '')
                        
                        if (!map[label]) {
                            map[label] = []
                        }

                        !processedItems[item.id] && map[label].push({
                            id: item.id,
                            title: item.snippet.title,
                            channelTitle: item.snippet.channelTitle,
                            thumbnail: item.snippet.thumbnails.standard ? item.snippet.thumbnails.standard: item.snippet.thumbnails.default,
                            url: `https://www.youtube.com/watch?v=${item.id}`
                        })

                        processedItems[item.id] = true;
                    } else if (!topicDetails[topicId]) {
                        console.log("Unknown topic:", topicId)
                    }
                })
            }
        })
    });

    return Object.keys(map).map((key) => {
        return {
            label: key,
            videos: map[key]
        }
    }).sort((a, b) => a.videos.length > b.videos.length ? -1 : 1)
}

const getLikedVideos = (pageToken) => axios({
    method: 'GET',
    headers: { 'Authorization': `Bearer ${config.googleServices.ENABLE_AUTH ? GoogleAuth.getCurrentUserToken() : ''}` },
    params: {
        'myRating': 'like',
        'part': 'snippet,contentDetails,topicDetails,statistics',
        'maxResults': '50',
        'pageToken': pageToken,
    },
    url: `${config.googleServices.services.youtube.URL}/videos`
})

export default async function loadLikedVideos(dataList = [], pageToken) {
    const getSome = async (dataList, pageToken, resolve) => {
        const { data } = await getLikedVideos(pageToken)
        const { nextPageToken } = data
        
        if (nextPageToken && dataList.length < pageLimit) {
            getSome(dataList.concat([data]), nextPageToken, resolve)
        } else {
            resolve(categoriseVideos(dataList))
        }
    }

    return new Promise((resolve) => {
        getSome(dataList, pageToken, resolve)
    })
}
