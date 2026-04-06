export interface SpotifyImage {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyArtist {
  id?: string;
  name: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  total_tracks?: number;
  uri?: string;
  [key: string]: any; // Allows flexibility for future unmapped properties while mandating core shape
}
