"use client";

import React from "react";
import { Loader2 } from "lucide-react";

import type { User } from "next-auth";
import type { Favorite, MyPlaylist } from "@/lib/db/schema";
import type { Episode, Sort } from "@/types";

import { SongListClient } from "@/components/song-list/song-list.client";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { getShowEpisodes } from "@/lib/jiosaavn-api";

type EpisodeListProps = {
  user?: User;
  showId: string;
  season: number;
  sort: Sort;
  totalEpisodes: number;
  initialEpisodes: Episode[];
  userFavorites?: Favorite;
  userPlaylists?: MyPlaylist[];
};

export function EpisodeList(props: EpisodeListProps) {
  const {
    user,
    showId,
    season,
    sort,
    totalEpisodes,
    initialEpisodes,
    userFavorites,
    userPlaylists,
  } = props;

  const [episodes, setEpisodes] = React.useState(initialEpisodes);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(
    totalEpisodes > initialEpisodes.length
  );

  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);
  const isLoadMoreVisible = !!useIntersectionObserver(loadMoreRef, {})
    ?.isIntersecting;

  React.useEffect(() => {
    if (isLoadMoreVisible) {
      (async () => {
        setIsLoading(true);
        const nextPage = page + 1;
        const response = await getShowEpisodes(showId, season, nextPage, sort);
        setEpisodes((episodes) => [...episodes, ...response]);
        setPage(nextPage);
        setHasMore(totalEpisodes > episodes.length);
        setIsLoading(false);
      })();
    }
  }, [isLoadMoreVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SongListClient
        user={user}
        items={episodes}
        userFavorites={userFavorites}
        userPlaylists={userPlaylists}
      />

      {hasMore ?
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center gap-2 font-bold text-muted-foreground"
        >
          {isLoading && (
            <>
              <Loader2 className="size-5 animate-spin" /> Loading...
            </>
          )}
        </div>
      : <h3 className="py-6 text-center font-heading text-xl drop-shadow-md dark:bg-gradient-to-br dark:from-neutral-200 dark:to-neutral-600 dark:bg-clip-text dark:text-transparent sm:text-2xl md:text-3xl">
          <em>Yay! You have seen it all</em> 🤩
        </h3>
      }
    </>
  );
}
