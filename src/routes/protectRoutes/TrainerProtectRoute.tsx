import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { getKycStatus } from "../../actions/trainerAction";
import { useNavigate } from "react-router-dom";
import TrainerKyc from "../../components/trainer/Trainerkyc";
import KycSubmitStatus from "../../components/trainer/KycSubmitStatus";
import KycRejectionStatus from "../../components/trainer/KycRejectionStatus";

interface TrainerProtectedRouteProps {
  children: React.ReactNode;
}

function TrainerProtectRoute({ children }: TrainerProtectedRouteProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { trainerInfo, kycStatus } = useSelector(
    (state: RootState) => state.trainer
  );
  const trainer_id = trainerInfo?.id;

  useEffect(() => {
    if (trainer_id) {
      dispatch(getKycStatus(trainer_id));
    } else {
      navigate("/trainer/login");
    }
  }, [trainer_id, dispatch, navigate]);

  if (!trainerInfo) {
    return null;
  } else if (kycStatus === "submitted") {
    return (
      <>
        <KycSubmitStatus />
      </>
    );
  } else if (kycStatus === "rejected") {
    return (
      <>
      <KycRejectionStatus />
      </>
    );
  }  else if (kycStatus === "pending") {
    return (
      <>
        <TrainerKyc />
      </>
    );
  } else {
    return <>{children}</>;
  }
}

export default TrainerProtectRoute;
