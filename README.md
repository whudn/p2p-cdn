# p2p-cdn
🛠️ How It Works
1. Local Cache Check (0 ms): First, checks if the requested asset exists in the visitor's browser Cache API.
2. P2P Swarm Fetch: If not cached locally, queries public WebTorrent trackers to stream/download the file directly from another online visitor via WebRTC.
3. Origin Fallback & Auto-Cache: If no peers are online or connection times out (2.5s), fetches the asset directly from your origin server and automatically saves it into the local cache for future visits and peer distribution.
   
## 📊 Architecture Flow

```text
[ Website Visitor ] 
        │
        ▼
  [ P2P Engine ] ──── (1. Local Hit) ────────────► [ Cache API (0 ms) ]
        │
        ├──────────── (2. Peer Found) ───────────► [ WebRTC P2P DataChannel ]
        │
        └──────────── (3. Zero Peers/Timeout) ───► [ Origin Server & Auto-Cache ]
