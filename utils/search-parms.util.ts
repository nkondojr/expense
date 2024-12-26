export class SearchParams {
  searchTerm: string;
  page: number;
  pageSize: number;

  constructor(
    searchTerm: string = '',
    page: number = 1,
    pageSize: number = 10,
  ) {
    this.searchTerm = searchTerm.trim();
    this.page = isNaN(page) || page < 1 ? 1 : page;
    this.pageSize = isNaN(pageSize) || pageSize < 1 ? 10 : pageSize;
  }
}
