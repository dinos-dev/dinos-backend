/**
 * @param NEAREST 가까운순 정렬 (반경 필터 없음)
 * @param M_100   100m 이내
 * @param M_500   500m 이내
 * @param KM_1    1km 이내
 * @param KM_3    3km 이내
 * @param KM_5    5km 이내
 */
export enum DistanceFilter {
  NEAREST = 'nearest',
  M_100 = '100',
  M_500 = '500',
  KM_1 = '1000',
  KM_3 = '3000',
  KM_5 = '5000',
}
