import type {PaginationProps} from 'ant-design-vue';
import type {OriginalMeta} from "@/types";

const useTransformMeta = (data: OriginalMeta): PaginationProps => ({
    total: data.totalCount,
    pageSize: data.perPage,
    current: data.currentPage,
});
const useTransformTableSorter = (sorter: any) => {
    return [sorter]
        .flat()
        .map((item) => `${item?.order === 'descend' ? '-' : ''}${item?.field}`)
}
export {
    useTransformMeta,
    useTransformTableSorter
}