import {request} from '../services/http'

export type Pagination<T> = {
  list: T[]
  total: number
  pageSize: number
  currentPage: number
}

/**
 * 房间的租约信息，包括预定
 */
export type LeaseInfoVo = {
  leaseId?: string;
  bookingId?: string;
  /**
   * 租约开始日期
   */
  leaseStartDate?: string;
  /**
   * 租约结束日期
   */
  leaseEndDate?: string;
  /**
   * 欠费天数
   */
  arrearsDays?: number;
  /**
   * 租户姓名
   */
  tenantName?: string;
  /**
   * 租户手机号
   */
  tenantPhone?: string;
};

export type FacilityItemDto = {
  name?: string;
  count?: string;
};

export type HouseLayoutDto = {
  /**
   * 主键id，tmp开头则为临时id
   */
  id?: string;
  /**
   * 房型名称
   */
  layoutName?: string;
  /**
   * 厅
   */
  livingRoom?: number;
  /**
   * 卫
   */
  bathroom?: number;
  /**
   * 厨
   */
  kitchen?: number;
  /**
   * 室
   */
  bedroom?: number;
  /**
   * 设施、从字典dict_data获取并配置
   */
  facilities?: Array<FacilityItemDto>;
  /**
   * 标签
   */
  tags?: Array<string>;
  /**
   * 图片列表
   */
  imageList?: Array<string>;
  /**
   * 视频列表
   */
  videoList?: Array<string>;
  /**
   * 新创建的
   */
  newly?: boolean;
};

export type RoomListVo = {

  /**
   * 房间id
   */
  roomId?: string;
  /**
   * 房源ID
   */
  houseId?: string;
  /**
   * 小区ID
   */
  communityId?: string;
  /**
   * 小区名称
   */
  communityName?: string;
  /**
   * 房源编号
   */
  houseCode?: string;
  /**
   * 房源名称
   */
  houseName?: string;
  /**
   * 门牌号
   */
  doorNumber?: string;
  /**
   * 物业费
   */
  propertyFee?: number;
  /**
   * 来源id
   */
  leaseModeId?: string;
  /**
   * 房源租赁类型：1、集中式；2、整/合租
   */
  leaseMode?: number;
  /**
   * 出租类型：1-整租，2-合租，参考RentalTypeEnum
   */
  rentalType?: number;
  /**
   * 房型
   */
  houseLayout?: HouseLayoutDto;
  /**
   * 部门id
   */
  deptId?: string;
  /**
   * 部门名称
   */
  deptName?: string;
  /**
   * 房间号
   */
  roomNumber?: string;
  /**
   * 楼栋号
   */
  building?: string;
  /**
   * 单元号
   */
  unit?: string;
  /**
   * 楼层
   */
  floor?: number;
  /**
   * 出租价格
   */
  price?: number;
  /**
   * 标签
   */
  tags?: Array<string>;
  /**
   * 设施
   */
  facilities?: Array<FacilityItemDto>;
  /**
   * 图片列表
   */
  imageList?: Array<string>;
  /**
   * 视频列表
   */
  videoList?: Array<string>;
  /**
   * 可出租日期
   */
  availableDate?: string;
  /**
   * 空置开始时间
   */
  vacancyStartTime?: string;
  /**
   * 面积
   */
  area?: number;
  /**
   * 朝向
   */
  direction?: string;
  /**
   * 房间状态
   */
  occupancyStatus?: number;
  /**
   * 房间状态，参考：OccupancyStatusEnum
   */
  occupancyStatusName?: string;
  /**
   * 房间状态颜色，参考：OccupancyStatusEnum
   */
  occupancyStatusColor?: string;
  /**
   * 锁定状态
   */
  locked?: boolean;
  /**
   * 禁用状态：是否已禁用
   */
  closed?: boolean;
  /**
   * 负责人id
   */
  salesmanId?: string;
  /**
   * 负责人姓名
   */
  salesmanName?: string;
  /**
   * 负责人手机号
   */
  salesmanPhone?: string;
  /**
   * 租约信息
   */
  leaseInfo?: LeaseInfoVo;
}

export function getRoomList(data: Record<string, any>) {
  return request<Pagination<RoomListVo>>({url: 'room/list', data})
}
