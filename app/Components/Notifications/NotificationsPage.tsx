"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, ChevronDown, Loader2 } from "lucide-react";
import { Notification } from "@/app/types/notification";
import { notificationsService } from "@/services/notifications.services";
import { connectSocket } from "@/services/socket.services";
import NotificationCard from "./NotificationsCard";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

const PAGE_LIMIT = 20;

export default function NotificationsPage() {
  const [markingAll, setMarkingAll] = useState(false);
  const queryClient = useQueryClient();

  const notificationsQuery = useInfiniteQuery({
    queryKey: ["notifications"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      notificationsService.getNotifications(pageParam, PAGE_LIMIT),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },
    staleTime: 1000 * 30,
  });

  const notifications = useMemo(
    () =>
      notificationsQuery.data?.pages.flatMap(
        (page) => (page?.data?.items ?? []) as Notification[],
      ) ?? [],
    [notificationsQuery.data],
  );
  const total = notificationsQuery.data?.pages[0]?.data?.pagination?.total ?? 0;
  const hasMore = notifications.length < total;
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  // Socket — real-time incoming notifications
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    const handleNotification = (notif: Notification) => {
      queryClient.setQueryData(["notifications"], (prev: any) => {
        if (!prev?.pages?.length) return prev;
        const firstPageItems = (prev.pages[0]?.data?.items ??
          []) as Notification[];
        if (firstPageItems.some((item) => item.id === notif.id)) return prev;

        const updatedFirstPage = {
          ...prev.pages[0],
          data: {
            ...prev.pages[0].data,
            items: [notif, ...firstPageItems].slice(0, PAGE_LIMIT),
            pagination: {
              ...prev.pages[0].data.pagination,
              total: (prev.pages[0].data.pagination?.total ?? 0) + 1,
            },
          },
        };

        return {
          ...prev,
          pages: [updatedFirstPage, ...prev.pages.slice(1)],
        };
      });
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [queryClient]);

  async function handleMarkRead(id: string) {
    try {
      await notificationsService.markRead(id);
      queryClient.setQueryData(["notifications"], (prev: any) => {
        if (!prev?.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              items: (page.data?.items ?? []).map(
                (notification: Notification) =>
                  notification.id === id
                    ? { ...notification, readAt: new Date().toISOString() }
                    : notification,
              ),
            },
          })),
        };
      });
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await notificationsService.markAllRead();
      queryClient.setQueryData(["notifications"], (prev: any) => {
        if (!prev?.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              items: (page.data?.items ?? []).map(
                (notification: Notification) => ({
                  ...notification,
                  readAt: notification.readAt ?? new Date().toISOString(),
                }),
              ),
            },
          })),
        };
      });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleShowMore() {
    await notificationsQuery.fetchNextPage();
  }

  return (
    // Full screen on mobile, centred card on desktop
    <div className="min-h-screen bg-white md:bg-gray-50 md:py-8 md:px-4">
      <div className="w-full md:max-w-2xl md:mx-auto md:bg-white md:border md:border-gray-200 md:rounded-2xl md:overflow-hidden md:shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-[#E5E7EB]">
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
              <span className="hidden sm:inline">Mark all as read</span>
            </button>
          )}
        </div>

        {/* Body */}
        {notificationsQuery.isLoading ? (
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
              <div className="flex justify-center py-4 border-t border-[#E5E7EB]">
                <button
                  onClick={handleShowMore}
                  disabled={notificationsQuery.isFetchingNextPage}
                  className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition disabled:opacity-50"
                >
                  {notificationsQuery.isFetchingNextPage ? (
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
