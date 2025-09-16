import React, { useEffect, useRef, useState } from "react";
import chatService from "../services/chatservice"// adjust the path as per your project

const VideoCall = ({ localUserId, remoteUserId }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef(null);

  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    chatService.onReceiveOffer(async (fromUserId, offer) => {
      if (fromUserId !== remoteUserId) return;
      const peer = createPeer();
      await peer.setRemoteDescription(JSON.parse(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      chatService.sendAnswer(fromUserId, answer);
    });

    chatService.onReceiveAnswer(async (answer, fromUserId) => {
      if (fromUserId !== remoteUserId) return;
      const remoteDesc = new RTCSessionDescription(JSON.parse(answer));
      await peerRef.current.setRemoteDescription(remoteDesc);
    });

    chatService.onReceiveIceCandidate(async (candidate, fromUserId) => {
      if (fromUserId !== remoteUserId) return;
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    return () => {
    };
  }, [remoteUserId]);

  const startCall = async () => {
    const peer = createPeer();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    chatService.sendOffer(remoteUserId, offer);
    setCallStarted(true);
  };

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        chatService.sendIceCandidate(remoteUserId, e.candidate);
      }
    };

    peer.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    });

    peerRef.current = peer;
    return peer;
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Video Call</h3>
      {!callStarted && <button onClick={startCall}>Start Call</button>}
      <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
        <video ref={localVideoRef} autoPlay muted width="300" />
        <video ref={remoteVideoRef} autoPlay width="300" />
      </div>
    </div>
  );
};

export default VideoCall;
