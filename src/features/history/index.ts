// Feature: full meeting history with search and status filtering. Milestone 13's fancier
// (trigram) search is deferred; this is a plain, correct `contains` search that's fine at
// personal scale.
// Public API of this feature. Other code may import only from here.
export { searchMeetings, RESULTS_LIMIT } from "./services/search-meetings";
export type { SearchMeetingsFilters } from "./services/search-meetings";
export { HistoryFilters } from "./components/history-filters";
export { HistoryList } from "./components/history-list";
