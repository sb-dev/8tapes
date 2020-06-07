import GoogleAuth from './googleAuth';
import axios from 'axios';
import config from '../config';
import topicDetails from './topicDetails'

const pageLimit = config.googleServices.services.youtube.QUERY_LIMIT;

const categoriseVideos = (dataList) => {    
    const map = {};
    const processedItems = {};

    dataList.forEach(element => {
        element.items && element.items.forEach((item) => {
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
                            duration: item.contentDetails.duration,
                            url: `https://www.youtube.com/watch?v=${item.id}`,
                            source: 'youtube'
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

const getLikedVideos = (pageToken) => {
    return new Promise(async (resolve) => {
        if(config.googleServices.ENABLE_AUTH) {
            const client = await GoogleAuth.getClient()
            const request = client.request({
                'method': 'GET',
                'path': '/youtube/v3/videos',
                'params': {
                    'myRating': 'like',
                    'part': 'snippet,contentDetails,topicDetails,statistics',
                    'maxResults': '50',
                    'pageToken': pageToken,
                }
            });
    
            request.execute(function(response) {
                resolve(response);
            });
        } else {
            axios({
                method: 'GET',
                params: {
                    'myRating': 'like',
                    'part': 'snippet,contentDetails,topicDetails,statistics',
                    'maxResults': '50',
                    'pageToken': pageToken,
                },
                url: `${config.googleServices.services.youtube.URL}/videos`
            }).then((response) => {
                resolve(response.data);
            })
        }
    })    
}

export default async function loadLikedVideos(dataList = [], pageToken) {
    const getSome = async (dataList, pageToken, resolve) => {
        const data = await getLikedVideos(pageToken)
        const result = dataList.concat([data])
        const { nextPageToken } = data
        if (nextPageToken && dataList.length < pageLimit) {
            getSome(result, nextPageToken, resolve)
        } else {
            resolve(categoriseVideos(result))
        }
    }

    return new Promise((resolve) => {
        getSome(dataList, pageToken, resolve)
    })
}
