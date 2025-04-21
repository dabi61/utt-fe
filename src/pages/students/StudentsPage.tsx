import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const StudentsPage = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Quản lý sinh viên
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Box>
          <Typography variant="body1">
            Chức năng đang được phát triển. Vui lòng quay lại sau.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default StudentsPage; 