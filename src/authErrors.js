// Supabase 인증 오류를 한국어 메시지로 바꾼다.
export function koreanAuthError(error) {
  if (!error) return ''
  const msg = (error.message || '').toLowerCase()
  const code = error.code || ''

  if (code === 'invalid_credentials' || msg.includes('invalid login credentials'))
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed'))
    return '이메일 인증이 완료되지 않았습니다. 받은 편지함의 인증 메일을 확인해 주세요.'
  if (code === 'user_already_exists' || msg.includes('already registered') || msg.includes('already been registered'))
    return '이미 가입된 이메일입니다. 로그인해 주세요.'
  if (code === 'weak_password' || msg.includes('password should be at least'))
    return '비밀번호는 6자 이상이어야 합니다.'
  if (code === 'email_address_invalid' || msg.includes('unable to validate email') || msg.includes('invalid email'))
    return '올바른 이메일 주소를 입력해 주세요.'
  if (code === 'over_email_send_rate_limit' || msg.includes('rate limit') || msg.includes('too many requests') || error.status === 429)
    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
  if (msg.includes('failed to fetch') || msg.includes('network'))
    return '네트워크 오류가 발생했습니다. 연결을 확인하고 다시 시도해 주세요.'
  if (code === 'signup_disabled' || msg.includes('signups not allowed'))
    return '현재 회원가입이 허용되지 않습니다.'
  return '문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
}
