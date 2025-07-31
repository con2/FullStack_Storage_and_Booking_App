import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { Badge } from "@/components/ui/badge";
import {
  checkUserBanStatus,
  selectUserBanStatuses,
  selectUserBanningLoading,
} from "@/store/slices/userBanningSlice";

interface UserBanStatusProps {
  userId: string;
}

const UserBanStatus = ({ userId }: UserBanStatusProps) => {
  const dispatch = useAppDispatch();
  const userBanStatuses = useAppSelector(selectUserBanStatuses);
  const banStatus = userBanStatuses[userId];
  const loading = useAppSelector(selectUserBanningLoading);
  const { lang } = useLanguage();

  useEffect(() => {
    if (userId) {
      void dispatch(checkUserBanStatus(userId));
    }
  }, [dispatch, userId]);

  if (loading) {
    return <span className="text-xs text-gray-500">...</span>;
  }

  if (!banStatus || !banStatus.isBanned) {
    return (
      <Badge variant="secondary" className="text-xs">
        {t.userBanning.status.active[lang]}
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="text-xs">
      {t.userBanning.status.banned[lang]}
    </Badge>
  );
};

export default UserBanStatus;
