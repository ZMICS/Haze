import requests
from google.transit import gtfs_realtime_pb2


def fetch_gtfs_realtime(feed_url: str):
    response = requests.get(feed_url, timeout=10)
    response.raise_for_status()

    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(response.content)

    return feed