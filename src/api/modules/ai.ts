import { post } from '../request';
import { API_ENDPOINTS, API_CONFIG } from '../config';
import type {
  NaturalQueryRequest,
  NaturalQueryResponse,
  ValidateSqlRequest,
  ValidateSqlResponse,
} from '../../types/connection';

// AI 自然语言查询
export async function aiQuery(data: NaturalQueryRequest) {
  return post<NaturalQueryResponse>(API_ENDPOINTS.aiQuery, data, {
    timeout: API_CONFIG.aiTimeout,
  });
}

// AI SQL 校验
export async function aiValidate(data: ValidateSqlRequest) {
  return post<ValidateSqlResponse>(API_ENDPOINTS.aiValidate, data);
}
