import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';


const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('accessToken');

export const register = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    // formData is a FormData object (with files + fields)
    const res = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    return rejectWithValue({
      message: err.response?.data?.message || 'Login failed',
      verificationStatus: err.response?.data?.verificationStatus,
      verificationNote: err.response?.data?.verificationNote,
    });
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch (_) {}
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const resubmitDocuments = createAsyncThunk('auth/resubmitDocuments', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/resubmit-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Resubmission failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    loading: false,
    error: null,
    registerSuccess: false,
    loginVerificationStatus: null,
    loginVerificationNote: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => { state.user = action.payload; },
    clearRegisterSuccess: (state) => { state.registerSuccess = false; },
    clearLoginVerification: (state) => {
      state.loginVerificationStatus = null;
      state.loginVerificationNote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; s.registerSuccess = false; })
      .addCase(register.fulfilled, (s) => {
        s.loading = false;
        s.registerSuccess = true;
        // No user/token stored — account is pending admin approval
      })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.loginVerificationStatus = null;
        s.loginVerificationNote = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.accessToken;
        localStorage.setItem('accessToken', a.payload.accessToken);
        localStorage.setItem('user', JSON.stringify(a.payload.user));
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.message || a.payload;
        s.loginVerificationStatus = a.payload?.verificationStatus || null;
        s.loginVerificationNote = a.payload?.verificationNote || null;
      })

      .addCase(logout.fulfilled, (s) => { s.user = null; s.token = null; })

      .addCase(fetchMe.pending, (s) => {  })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.user = a.payload.user;
        localStorage.setItem('user', JSON.stringify(a.payload.user));
      })
      .addCase(fetchMe.rejected, (s) => {
        s.user = null;
        s.token = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      })

      .addCase(resubmitDocuments.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(resubmitDocuments.fulfilled, (s) => { s.loading = false; s.registerSuccess = true; })
      .addCase(resubmitDocuments.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearError, setUser, clearRegisterSuccess, clearLoginVerification } = authSlice.actions;
export default authSlice.reducer;
