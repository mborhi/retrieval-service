export interface TrackData {
    name: string
    previewURL: string
    trackURI: string
    trackNum: number
    trackAlbumImage: string
}

export type PlaylistNameAndTracks = {
    playlistName: string
    playlistTracks: TrackData[]
}

export interface CollectionMember {
    id: string
    name: string
}