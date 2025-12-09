export const baseUrl: any = "https://peoplely-api.onrender.com";
// export const buildDynamicURL = (
//   base: any,
//   applicationStatus: any,
//   interviewStatus: any
// ) => {
//   let baseURL = `${base}`;
//   let queryParams: string[] = [];

//   // Add 'Application Status' to the query parameters if it's not null or undefined
//   if (applicationStatus !== null && applicationStatus !== undefined) {
//     queryParams.push(`applicationStatus=${applicationStatus}`);
//   }

//   // Add 'Interview Status' to the query parameters if it's not null or undefined
//   if (interviewStatus !== null && interviewStatus !== undefined) {
//     queryParams.push(`interviewStatus=${interviewStatus}`);
//   }

//   // Combine the base URL and query parameters
//   if (queryParams.length > 0) {
//     baseURL += "?" + queryParams.join("&");
//   }

//   return baseURL;
// };
