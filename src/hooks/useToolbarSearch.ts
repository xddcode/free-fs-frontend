import { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'

/**
 * 工具栏搜索统一逻辑：
 * - searchInput：输入框展示，随按键变化，不触发列表请求
 * - searchKeyword：回车提交后生效，用于接口查询
 * - commitSearch：写入 URL query（默认参数名 keyword），并与前进/后退同步
 */
export function useToolbarSearch(paramName = 'keyword') {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const urlValue = searchParams.get(paramName) || ''
  const [searchInput, setSearchInput] = useState(urlValue)
  const [searchKeyword, setSearchKeyword] = useState(urlValue)

  useEffect(() => {
    setSearchKeyword(urlValue)
    setSearchInput(urlValue)
  }, [urlValue])

  const commitSearch = useCallback(
    (keyword: string) => {
      setSearchKeyword(keyword)
      setSearchInput(keyword)
      const params = new URLSearchParams(searchParams)
      if (keyword) {
        params.set(paramName, keyword)
      } else {
        params.delete(paramName)
      }
      navigate(`${pathname}?${params.toString()}`, { replace: true })
    },
    [searchParams, navigate, pathname, paramName]
  )

  return {
    searchInput,
    setSearchInput,
    searchKeyword,
    commitSearch,
  }
}
