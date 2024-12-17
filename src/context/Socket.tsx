import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Socket, io } from "socket.io-client";
import { AppDispatch, RootState } from "../app/store";
import { useDispatch } from "react-redux";
import { endCallUser, setShowIncomingVideoCall, setRoomIdUser, setShowVideoCallUser, setVideoCallUser } from "../features/user/userSlice";
import { endCallTrainer,setVideoCall, setShowVideoCall, setRoomId , setPrescription} from "../features/trainer/trainerSlice";
import toast from "react-hot-toast";
import { useNotification } from "./NotificationContext ";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userInfo } = useSelector((state: RootState) => state.user);
  const { trainerInfo } = useSelector((state: RootState) => state.trainer);
  const loggedUser = userInfo?.id || trainerInfo?.id || null;
  const dispatch = useDispatch<AppDispatch>();
  const {addTrainerNotification, addUserNotification} = useNotification()
  
  const newSocket = io("http://localhost:3000", {
    query: { userId: loggedUser },
    transports: ['websocket'],
  });
  
  useEffect(() => {
    if (!loggedUser) {
      console.warn("No loggedUser; skipping socket initialization.");
      setSocket(null); 
      return;
    }

    console.log("Initializing socket for loggedUser:", loggedUser);


    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setSocket(newSocket);
    });

    return () => {
      console.log("Cleaning up socket...");
      newSocket.disconnect();
      setSocket(null); 
    };
  }, [loggedUser]);

  useEffect(() => {
    if (!socket) {
      console.warn("Socket instance is null; skipping event listener setup.");
      return;
    }

    console.log("Setting up event listeners for socket:", socket.id);

    

    newSocket.on("incoming-video-call", (data: any) => {
      console.log("Incoming video call:", data);
      dispatch(
        setShowIncomingVideoCall({
          _id: data._id,
          trainerId: data.from,
          callType: data.callType,
          trainerName: data.trainerName,
          trainerImage: data.trainerImage,
          roomId: data.roomId,
        })
      );
    });

    newSocket.on("accepted-call", (data: any) => {
      dispatch(setRoomId(data.roomId));
      dispatch(setShowVideoCall(true));

      newSocket.emit("trainer-call-accept", {
        roomId: data.roomId,
        trainerId: data.from, 
        to: data._id,      
    });
    });

    newSocket.on('trianer-accept', (data: any) => {
      dispatch(setRoomId(data.roomId))
      dispatch(setShowVideoCall(true))
    })

    newSocket.on("call-rejected", () => { 
      toast.error("Call ended or rejected ");
      dispatch(setVideoCall(null))
      dispatch(endCallTrainer());
      dispatch(endCallUser());
    });

    newSocket?.on("user-left", (data) => {
    
      if (data === userInfo?.id) {
        dispatch(setPrescription(true))
        dispatch(setShowVideoCallUser(false));
        dispatch(setRoomIdUser(null));
        dispatch(setVideoCallUser(null));
        dispatch(setShowIncomingVideoCall(null));
      } 
      
      else if (data === trainerInfo?.id) {
        
        dispatch(setPrescription(true))
        dispatch(setShowVideoCall(false));
        dispatch(setRoomId(null));
        dispatch(setVideoCall(null));
      }
    });

    newSocket.on('receiveCancelNotificationForTrainer', (data: string) => {
      addTrainerNotification(data);
    });
    newSocket.on('receiveCancelNotificationForUser', (data: string) => {
      addUserNotification(data);
    });
    
    newSocket.on('receiveNewBooking', (data: string) => {
      addTrainerNotification(data);
    });
    
    
    return () => {
      console.log("Cleaning up socket event listeners...");
      socket.off("incoming-video-call");
      socket.off("accepted-call");
      newSocket.off("call-rejected");
      newSocket.off('receiveCancelNotificationForTrainer')
      newSocket.off('receiveCancelNotificationForUser')
      newSocket.off('receiveNewBooking')

    };
  }, [newSocket, dispatch,addUserNotification, addTrainerNotification]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;

}

