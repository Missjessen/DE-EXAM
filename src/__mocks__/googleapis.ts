// // __mocks__/googleapis.ts
// export const google = {
//   auth: {
//     OAuth2: jest.fn().mockImplementation(() => ({
//       generateAuthUrl: jest.fn().mockReturnValue('https://fake.url'),
//       getToken: jest.fn().mockResolvedValue({
//         tokens: {
//           access_token: 'fake-access-token',
//           refresh_token: 'fake-refresh-token',
//           expiry_date: Date.now() + 3600_000
//         }
//       }),
//       setCredentials: jest.fn(),
//       getAccessToken: jest.fn().mockResolvedValue({ token: 'fake-access-token' })
//     }))
//   },
//   oauth2: jest.fn().mockReturnValue({
//     userinfo: {
//       get: jest.fn().mockResolvedValue({ data: { id: '123', email: 'test@user.com' } })
//     }
//   }),
//   sheets: jest.fn().mockReturnValue({
//     spreadsheets: {
//       create: jest.fn().mockResolvedValue({
//         data: { spreadsheetId: 'sheet123', sheets: [{ properties: { title: 'Kampagner', sheetId: 0 } }] }
//       }),
//       values: {
//         batchUpdate: jest.fn().mockResolvedValue({}),
//         update: jest.fn().mockResolvedValue({}),
//         get: jest.fn().mockResolvedValue({ data: { values: [['Campaign','ENABLED','0','20250101','20250131']] } })
//       }
//     }
//   })
// };
