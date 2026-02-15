"use client";

import { isUserAdmin } from "@/features/auth/authService";
import { useSession, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type Connection = {
  conversation_id: string;
  user1: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    pfp_url: string | null;
    title: string | null;
  };
  user2: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    pfp_url: string | null;
    title: string | null;
  };
  message_count: number;
  created_at: string;
  last_message_at: string | null;
};

type SortField = "created_at" | "last_message_at" | "message_count";
type SortDirection = "asc" | "desc";

export default function AdminConnectionsPage() {
  // --- Check Admin Status ---
  const { user } = useUser();
  const { session } = useSession();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const token = await session?.getToken();
      if (!token) {
        setIsAdmin(false);
        return;
      }
      const admin = await isUserAdmin(user.id, token);
      setIsAdmin(admin?.is_admin ? true : false);
    }
    checkAdmin();
  }, [user, session]);

  useEffect(() => {
    async function fetchConnections() {
      if (!isAdmin) return;

      try {
        setLoading(true);
        const token = await session?.getToken();

        const response = await fetch("/api/admin/connections", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch connections");
        }

        const data = await response.json();
        setConnections(data.connections || []);
      } catch (err) {
        console.error("Error fetching connections:", err);
        setError("Failed to load connections data");
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchConnections();
    }
  }, [isAdmin, session]);

  const userId = user?.id;
  if (!userId) {
    return <div className="p-8">Unauthorized. Please Sign In</div>;
  }

  if (isAdmin === null || loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="p-8">Access denied. Admins only.</div>;
  }

  // Filter connections based on search term
  const filteredConnections = connections.filter((conn) => {
    const searchLower = searchTerm.toLowerCase();
    const user1Name =
      `${conn.user1.first_name || ""} ${conn.user1.last_name || ""}`.toLowerCase();
    const user2Name =
      `${conn.user2.first_name || ""} ${conn.user2.last_name || ""}`.toLowerCase();
    const user1Title = (conn.user1.title || "").toLowerCase();
    const user2Title = (conn.user2.title || "").toLowerCase();

    return (
      user1Name.includes(searchLower) ||
      user2Name.includes(searchLower) ||
      user1Title.includes(searchLower) ||
      user2Title.includes(searchLower)
    );
  });

  // Sort connections
  const sortedConnections = [...filteredConnections].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortField === "message_count") {
      aValue = a.message_count;
      bValue = b.message_count;
    } else if (sortField === "last_message_at") {
      aValue = a.last_message_at || "";
      bValue = b.last_message_at || "";
    } else {
      aValue = a.created_at;
      bValue = b.created_at;
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Calculate stats
  const totalConnections = connections.length;
  const uniqueUsers = new Set([
    ...connections.map((c) => c.user1.user_id),
    ...connections.map((c) => c.user2.user_id),
  ]);
  const totalUsers = uniqueUsers.size;
  const totalMessages = connections.reduce(
    (sum, conn) => sum + conn.message_count,
    0,
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const UserCard = ({
    user,
  }: {
    user: Connection["user1"] | Connection["user2"];
  }) => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
        {user.pfp_url ? (
          <img
            src={user.pfp_url}
            alt={`${user.first_name} ${user.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold">
            {user.first_name?.[0]}
            {user.last_name?.[0]}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="font-medium truncate">
          {user.first_name} {user.last_name}
        </div>
        <div className="text-sm text-gray-400 truncate">{user.title}</div>
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Connections Dashboard [Admin Only]
        </h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Total Connections</div>
            <div className="text-3xl font-bold">{totalConnections}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Unique Users</div>
            <div className="text-3xl font-bold">{totalUsers}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Total Messages</div>
            <div className="text-3xl font-bold">{totalMessages}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Connections Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User 1
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User 2
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("message_count")}
                  >
                    Messages{" "}
                    {sortField === "message_count" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("created_at")}
                  >
                    Connected{" "}
                    {sortField === "created_at" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("last_message_at")}
                  >
                    Last Active{" "}
                    {sortField === "last_message_at" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedConnections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      {searchTerm
                        ? "No connections found matching your search"
                        : "No connections yet"}
                    </td>
                  </tr>
                ) : (
                  sortedConnections.map((connection) => (
                    <tr
                      key={connection.conversation_id}
                      className="hover:bg-gray-750"
                    >
                      <td className="px-6 py-4">
                        <UserCard user={connection.user1} />
                      </td>
                      <td className="px-6 py-4">
                        <UserCard user={connection.user2} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                          {connection.message_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {formatDate(connection.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {formatDate(connection.last_message_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Showing {sortedConnections.length} of {totalConnections} connections
        </div>
      </div>
    </section>
  );
}
