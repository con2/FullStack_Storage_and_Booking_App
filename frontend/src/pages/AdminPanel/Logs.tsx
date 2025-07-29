import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllLogs,
  selectAllLogs,
  selectLogsError,
  selectLogsLoading,
  selectLogsPagination,
} from "@/store/slices/logsSlice";
import { t } from "@/translations";
import { LogMessage } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Bug,
  Eye,
  FileText,
  Info,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Logs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const loading = useAppSelector(selectLogsLoading);
  const error = useAppSelector(selectLogsError);
  const logs = useAppSelector(selectAllLogs);

  // State for filtering and viewing details
  const [logTypeFilter, setLogTypeFilter] = useState<
    "all" | "audit" | "system" | "errors"
  >("all");
  const [levelFilter, setLevelFilter] = useState<
    "all" | "error" | "warning" | "info" | "debug"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<LogMessage | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);

  // track page number and size
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const totalPages = useAppSelector(selectLogsPagination).totalPages ?? 0;
  const apiLogType =
    logTypeFilter === "all" || logTypeFilter === "errors"
      ? undefined
      : logTypeFilter;

  const apiLevel = levelFilter === "all" ? undefined : levelFilter;

  const apiLevelForErrors = logTypeFilter === "errors" ? "error" : apiLevel;

  useEffect(() => {
    void dispatch(
      getAllLogs({
        page: pageIndex + 1,
        limit: pageSize,
        logType: apiLogType,
        level: apiLevelForErrors,
        search: searchQuery || undefined,
      }),
    );
  }, [
    dispatch,
    pageIndex,
    pageSize,
    logTypeFilter,
    levelFilter,
    searchQuery,
    apiLogType,
    apiLevelForErrors,
  ]);

  const refreshLogs = () => {
    void dispatch(
      getAllLogs({
        page: pageIndex + 1,
        limit: pageSize,
        logType: apiLogType,
        level: apiLevelForErrors,
        search: searchQuery || undefined,
      }),
    );
  };

  // reset pageIndex to 0 when filters change
  useEffect(() => {
    setPageIndex(0);
  }, [logTypeFilter, levelFilter, searchQuery]);

  // Get level icon based on log level
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "debug":
        return <Bug className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const handleViewLogDetails = (log: LogMessage) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  const columns: ColumnDef<LogMessage>[] = [
    {
      id: "level-icon",
      size: 40,
      enableSorting: true,
      cell: ({ row }) => getLevelIcon(row.original.level),
      header: () => <div className="px-2"></div>,
    },
    {
      accessorKey: "timestamp",
      size: 150,
      header: () => <span>{t.logs.columns.timestamp[lang]}</span>,
      cell: ({ row }) => {
        const date = new Date(row.original.timestamp);
        return (
          <div className="whitespace-nowrap p-2">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        );
      },
    },
    {
      accessorKey: "level",
      header: () => (
        <span className="whitespace-nowrap p-2">
          {t.logs.columns.level[lang]}
        </span>
      ),
      cell: ({ row }) => {
        const level = row.original.level;
        let classes = "bg-gray-100 text-gray-800 border-gray-300";

        if (level === "error") {
          classes = "bg-red-100 text-red-800 border-red-300";
        } else if (level === "warning") {
          classes = "bg-yellow-100 text-yellow-800 border-yellow-300";
        } else if (level === "info") {
          classes = "bg-blue-100 text-blue-800 border-blue-300";
        } else if (level === "debug") {
          classes = "bg-gray-100 text-gray-800 border-gray-300";
        }

        return (
          <div className="p-2">
            <Badge variant={"outline"} className={classes}>
              {level}
            </Badge>
          </div>
        );
      },
      size: 100,
    },
    {
      accessorKey: "source",
      header: () => (
        <span className="whitespace-nowrap p-2">
          {t.logs.columns.source[lang]}
        </span>
      ),
      cell: ({ row }) => {
        const source = row.original.source || "-";
        const isDbSource = source.startsWith("DB:");

        return (
          <div className="flex items-center">
            {isDbSource && <FileText className="mr-1 h-4 w-4 text-blue-500" />}
            <span className={isDbSource ? "text-blue-600 font-medium" : ""}>
              {source}
            </span>
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "message",
      header: () => (
        <span className="whitespace-nowrap p-2">
          {t.logs.columns.message[lang]}
        </span>
      ),
      cell: ({ row }) => (
        <div className="max-w-xl truncate p-2">{row.original.message}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewLogDetails(row.original)}
          className="flex items-center"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      header: "",
      size: 50,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin h-12 w-12 text-secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={refreshLogs} variant="secondary" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t.logs.buttons.retry[lang]}
        </Button>
      </div>
    );
  }

  // Format a timestamp for the details view
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat(lang === "fi" ? "fi-FI" : "en-US", {
        dateStyle: "full",
        timeStyle: "long",
      }).format(date);
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl">{t.logs.title[lang]}</h1>
        <Button
          onClick={refreshLogs}
          variant="outline"
          size="sm"
          className="px-3 py-1 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {t.logs.buttons.refresh[lang]}
        </Button>
      </div>

      {/* Filters - styled like AdminItemsTable */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          {/* Search by log message/source */}
          <input
            id="search-logs"
            placeholder={
              t.logs.filters.searchPlaceholder[lang] ||
              "Search in message or source..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          />

          {/* Filter by log type */}
          <Select
            value={logTypeFilter}
            onValueChange={(value) =>
              setLogTypeFilter(value as "all" | "audit" | "system" | "errors")
            }
          >
            <SelectTrigger
              id="log-type-filter"
              className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)] w-[180px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t.logs.filters.all[lang] || "All Types"}
              </SelectItem>
              <SelectItem value="audit">
                {t.logs.filters.audit[lang] || "Database Changes"}
              </SelectItem>
              <SelectItem value="system">
                {t.logs.filters.system[lang] || "System Events"}
              </SelectItem>
              <SelectItem value="errors">
                {t.logs.filters.errors[lang] || "System Errors"}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Filter by severity level */}
          <Select
            value={levelFilter}
            onValueChange={(value) =>
              setLevelFilter(
                value as "all" | "error" | "warning" | "info" | "debug",
              )
            }
          >
            <SelectTrigger
              id="level-filter"
              className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)] w-[180px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t.logs.filters.allLevels[lang] || "All Levels"}
              </SelectItem>
              <SelectItem value="error">
                {t.logs.filters.error[lang] || "Error"}
              </SelectItem>
              <SelectItem value="warning">
                {t.logs.filters.warning[lang] || "Warning"}
              </SelectItem>
              <SelectItem value="info">
                {t.logs.filters.info[lang] || "Info"}
              </SelectItem>
              <SelectItem value="debug">
                {t.logs.filters.debug[lang] || "Debug"}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters button */}
          {(searchQuery ||
            logTypeFilter !== "all" ||
            levelFilter !== "all") && (
            <Button
              onClick={() => {
                setLogTypeFilter("all");
                setLevelFilter("all");
                setSearchQuery("");
              }}
              size="sm"
              className="px-2 py-1 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
            >
              {t.logs.filters.reset[lang] || "Reset Filters"}
            </Button>
          )}
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          {searchQuery || logTypeFilter !== "all" || levelFilter !== "all"
            ? t.logs.noFilteredData[lang] || "No logs match your filters"
            : t.logs.noData[lang]}
        </div>
      ) : (
        <div>
          <PaginatedDataTable
            columns={columns}
            data={logs}
            pageIndex={pageIndex}
            pageCount={totalPages}
            onPageChange={setPageIndex}
          />
        </div>
      )}

      {/* Log Details Dialog - remains unchanged */}
      {selectedLog && (
        <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getLevelIcon(selectedLog.level)}
                <span>{t.logs.details.title[lang] || "Log Details"}</span>
                <Badge variant={"outline"} className="ml-2">
                  {selectedLog.metadata?.logType === "audit"
                    ? t.logs.types.audit[lang] || "Database"
                    : t.logs.types.system[lang] || "System"}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {formatTimestamp(selectedLog.timestamp)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">
                  {t.logs.details.source[lang] || "Source"}
                </h3>
                <p className="text-sm">{selectedLog.source || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium">
                  {t.logs.details.message[lang] || "Message"}
                </h3>
                <p className="text-sm bg-slate-50 p-2 rounded border">
                  {selectedLog.message}
                </p>
              </div>

              {selectedLog.metadata && (
                <div>
                  <h3 className="text-sm font-medium">
                    {t.logs.details.metadata[lang] || "Additional Data"}
                  </h3>
                  <pre className="text-xs bg-slate-50 p-2 rounded border overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Logs;
