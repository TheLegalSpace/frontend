"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, ChevronDown, Loader2 } from "lucide-react";
import { Notification } from "@/app/types/notification"; 
import { notificationsService } from "@/services/notifications.services"; 
import { getSocket, connectSocket } from "@/services/socket.services"; 
import NotificationCard from "./NotificationsCard";

const PAGE_LIMIT = 20;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  // Derived — no state needed
  const hasMore = notifications.length < total;
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const loadNotifications = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const data = await notificationsService.getNotifications(
          pageNum,
          PAGE_LIMIT
        );
        const items: Notification[] = data?.data?.items ?? [];
        const totalCount: number = data?.data?.total ?? 0;

        setTotal(totalCount);
        setNotifications((prev) => (append ? [...prev, ...items] : items));
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [] // no stale closure risk — no outside state referenced
  );

  // Initial load
  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  // Socket — real-time incoming notifications
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    socket.on("notification", (notif: Notification) => {
      setNotifications((prev) => {
        if (prev.find((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      // bump total so hasMore stays accurate
      setTotal((prev) => prev + 1);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  async function handleMarkRead(id: string) {
    try {
      await notificationsService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error("Failed to mark all read:", err);
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleShowMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    await loadNotifications(nextPage, true);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold text-gray-900">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCheck size={13} />
              )}
              Mark all as read
            </button>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Bell size={28} strokeWidth={1.5} />
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <>
            {notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onMarkRead={handleMarkRead}
              />
            ))}

            {/* Show More */}
            {hasMore && (
              <div className="flex justify-center py-4 border-t border-gray-100">
                <button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                  Show More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}