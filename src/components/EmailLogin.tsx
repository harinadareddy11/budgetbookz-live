import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBook, BsArrowLeft } from 'react-icons/bs';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
  otp: Yup.string().required('Required').length(6, 'OTP must be 6 digits')
});

export default function EmailLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center text-white mb-6 hover:opacity-80 transition-opacity"
        >
          <BsArrowLeft className="mr-2" /> Back
        </button>

        <div className="animate-bounce-slow mb-8">
          <BsBook className="text-6xl text-white animate-pulse" />
        </div>

        <div className="text-white mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Welcome to BudgetBookz</h1>
          <p className="opacity-90">Learn More, Spend Less</p>
        </div>

        <Formik
          initialValues={{ email: '', otp: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log(values);
            navigate('/dashboard');
          }}
        >
          {({ errors, touched }) => (
            <Form className="space-y-6 animate-slide-up">
              <div>
                <label htmlFor="email" className="block text-white opacity-90 mb-2">
                  Email Address
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50
                           focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                />
                {errors.email && touched.email && (
                  <div className="text-red-200 text-sm mt-1">{errors.email}</div>
                )}
              </div>

              <div>
                <label htmlFor="otp" className="block text-white opacity-90 mb-2">
                  OTP
                </label>
                <Field
                  name="otp"
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50
                           focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                />
                {errors.otp && touched.otp && (
                  <div className="text-red-200 text-sm mt-1">{errors.otp}</div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-white text-blue-500 py-4 rounded-lg font-semibold
                         hover:bg-blue-50 transition-all transform hover:scale-105"
              >
                Verify & Continue
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}