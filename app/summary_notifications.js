import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

// SummaryNotifications
// Props:
// - title: string (عنوان الشاشة)
// - serverDomain: string (مثال: https://api.example.com)
// - userId: string or number
// - extendDays: number (اختياري، قيمة الإضافة عند الضغط مستمر)

export default function SummaryNotifications({
  title = 'الإشعارات',
  serverDomain = '',
  userId = '',
  extendDays = 7,
}) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [itemLoading, setItemLoading] = useState({}) // { [id]: true }
  const abortRef = useRef(null)
  const isMountedRef = useRef(true)

  const baseUrl = typeof serverDomain === 'string' ? serverDomain.replace(/\/$/, '') : ''
  const isSecureBaseUrl = !baseUrl || baseUrl.startsWith('https://')
  if (!isSecureBaseUrl) {
    console.warn('summary_notifications: only HTTPS endpoints are allowed')
  }

  async function fetchNotifications() {
    if (!isSecureBaseUrl || !baseUrl || !userId) {
      if (isMountedRef.current) {
        setItems([])
        setLoading(false)
        setRefreshing(false)
      }
      return
    }

    if (abortRef.current) {
      try {
        abortRef.current.abort()
      } catch {}
    }

    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 15000)

    if (isMountedRef.current) setLoading(true)
    try {
      const res = await fetch(
        `${baseUrl}/summary_notifications?user_id=${encodeURIComponent(userId)}`,
        { signal: controller.signal }
      )

      if (!res.ok) throw new Error(`Server returned ${res.status}`)

      const data = await res.json()
      const sorted = Array.isArray(data)
        ? data.slice().sort((a, b) => {
            const ta = a?.created_at ? Number(a.created_at) : 0
            const tb = b?.created_at ? Number(b.created_at) : 0
            return tb - ta
          })
        : []
      if (isMountedRef.current) setItems(sorted)
    } catch (e) {
      if (e.name === 'AbortError') {
        console.warn('fetchNotifications aborted/timed out')
      } else {
        console.warn('fetchNotifications error', e)
        if (isMountedRef.current) Alert.alert('خطأ', 'فشل جلب الإشعارات من الخادم')
      }
    } finally {
      clearTimeout(timeout)
      abortRef.current = null
      if (isMountedRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchNotifications()
    return () => {
      isMountedRef.current = false
      if (abortRef.current) {
        try {
          abortRef.current.abort()
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, userId])

  async function handleExtend(item) {
    if (!baseUrl || !userId || !item) return
    const id = item.id ?? item.notification_id
    if (!id) return

    setItemLoading((p) => ({ ...p, [id]: true }))
    try {
      const body = { user_id: userId, item_id: id, additional_days: extendDays }
      const res = await fetch(`${baseUrl}/summary_extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Server ${res.status}`)
      const data = await res.json()
      if (isMountedRef.current) {
        Alert.alert('تم التمديد', 'تمت إضافة الأيام بنجاح')
        fetchNotifications()
      }
      return data
    } catch (e) {
      console.warn('extend error', e)
      if (isMountedRef.current) Alert.alert('خطأ', 'فشل تمديد العنصر')
    } finally {
      if (isMountedRef.current) {
        setItemLoading((p) => {
          const next = { ...p }
          delete next[id]
          return next
        })
      }
    }
  }

  async function handleFinish(item) {
    if (!baseUrl || !userId || !item) return
    const id = item.id ?? item.notification_id
    if (!id) return

    setItemLoading((p) => ({ ...p, [id]: true }))
    try {
      const body = {
        user_id: userId,
        item_id: id,
        ended_at: Math.floor(Date.now() / 1000),
        label: 'ended_by_user',
      }
      const res = await fetch(`${baseUrl}/summary_finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Server ${res.status}`)
      const data = await res.json()
      if (isMountedRef.current) {
        Alert.alert('تم الإنهاء', 'تم إنهاء العنصر ونقله للأرشيف')
        fetchNotifications()
      }
      return data
    } catch (e) {
      console.warn('finish error', e)
      if (isMountedRef.current) Alert.alert('خطأ', 'فشل إنهاء العنصر')
    } finally {
      if (isMountedRef.current) {
        setItemLoading((p) => {
          const next = { ...p }
          delete next[id]
          return next
        })
      }
    }
  }

  function renderItem({ item, index }) {
    // Prefer server notification fields, then fallbacks
    const title =
      item.notification_title || item.title || item.name || item.label || `إشعار ${index + 1}`
    const body =
      item.notification_body || item.summary || item.important_info || item.description || ''

    const id = item.id ?? item.notification_id ?? index
    const isLoading = Boolean(itemLoading[id])

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.smallText}>{String(id)}</Text>
        </View>
        {body ? <Text style={styles.bodyText}>{body}</Text> : null}
        <View style={styles.rowButtons}>
          <TouchableOpacity
            style={[styles.btn, styles.btnExtend, isLoading && styles.btnDisabled]}
            onPress={() => handleExtend(item)}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>مستمر</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnFinish, isLoading && styles.btnDisabled]}
            onPress={() => handleFinish(item)}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>انتهى</Text>}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{title}</Text>
      {loading && <ActivityIndicator size="small" style={{ marginVertical: 8 }} />}
      <FlatList
        data={items}
        keyExtractor={(i, idx) => String(i?.id ?? idx)}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          fetchNotifications()
        }}
        ListEmptyComponent={() => (!loading ? <Text style={styles.empty}>لا توجد إشعارات</Text> : null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  card: { borderRadius: 8, padding: 12, backgroundColor: '#f7f7f7', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleText: { fontSize: 16, fontWeight: '600' },
  smallText: { fontSize: 12, color: '#666' },
  bodyText: { marginTop: 6, color: '#333' },
  rowButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, marginLeft: 8 },
  btnExtend: { backgroundColor: '#2b8a3e' },
  btnFinish: { backgroundColor: '#c53030' },
  btnText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#666', marginTop: 20 },
  btnDisabled: { opacity: 0.6 },
})