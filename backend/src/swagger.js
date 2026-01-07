import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Safe-Save Backend API',
      version: '1.0.0',
      description: 'Backend API for the Safe-Save decentralized savings platform built on Cardano blockchain',
      contact: {
        name: 'Safe-Save Team',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.safe-save.io',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/connect-wallet',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        WalletConnectRequest: {
          type: 'object',
          required: ['walletAddress'],
          properties: {
            walletAddress: {
              type: 'string',
              example: 'addr_test1qz...',
              description: 'Cardano wallet address',
            },
            stakeAddress: {
              type: 'string',
              example: 'stake_test1uz...',
              description: 'Cardano stake address (optional)',
            },
            signature: {
              type: 'string',
              example: 'a4b3c2d1...',
              description: 'Wallet signature for authentication (optional)',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            walletAddress: {
              type: 'string',
              example: 'addr_test1qz...',
            },
            expiresIn: {
              type: 'string',
              example: '24h',
            },
          },
        },
        UserInfo: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            user: {
              type: 'object',
              properties: {
                walletAddress: {
                  type: 'string',
                  example: 'addr_test1qz...',
                },
                stakeAddress: {
                  type: 'string',
                  nullable: true,
                  example: 'stake_test1uz...',
                },
              },
            },
          },
        },
        SavingsData: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            savings: {
              type: 'object',
              properties: {
                wallet: {
                  type: 'string',
                  example: 'addr_test1qz...',
                },
                totalSavings: {
                  type: 'number',
                  example: 1500.5,
                  description: 'Total savings in ADA',
                },
                totalSavingsLovelace: {
                  type: 'integer',
                  example: 1500500000,
                  description: 'Total savings in Lovelace',
                },
                streak: {
                  type: 'integer',
                  example: 5,
                  description: 'Consecutive savings streak',
                },
                lastDeposit: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                  example: '2025-11-29T10:30:00Z',
                },
                utxoRef: {
                  type: 'string',
                  example: 'abc123...#0',
                },
                isNewMember: {
                  type: 'boolean',
                  example: false,
                },
              },
            },
          },
        },
        GroupTotal: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            groupTotal: {
              type: 'number',
              example: 50000.75,
              description: 'Total group savings in ADA',
            },
            groupTotalLovelace: {
              type: 'integer',
              example: 50000750000,
              description: 'Total group savings in Lovelace',
            },
          },
        },
        DepositRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: {
              type: 'number',
              example: 100,
              description: 'Deposit amount in ADA',
            },
          },
        },
        DepositResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Transaction prepared',
            },
            transaction: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  example: 'deposit',
                },
                amount: {
                  type: 'number',
                  example: 100,
                },
                lovelaceAmount: {
                  type: 'integer',
                  example: 100000000,
                },
                from: {
                  type: 'string',
                  example: 'addr_test1qz...',
                },
                to: {
                  type: 'string',
                  example: 'addr_test1wz...',
                },
                cbor: {
                  type: 'string',
                  example: 'placeholder_transaction_cbor',
                },
              },
            },
          },
        },
        StreakResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            streak: {
              type: 'integer',
              example: 5,
            },
            walletAddress: {
              type: 'string',
              example: 'addr_test1qz...',
            },
          },
        },
        LoanStatus: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            loans: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  borrower: {
                    type: 'string',
                    example: 'addr_test1qz...',
                  },
                  loanAmount: {
                    type: 'number',
                    example: 500,
                  },
                  interest: {
                    type: 'number',
                    example: 25,
                  },
                  dueDate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2025-12-29T10:30:00Z',
                  },
                  repaidAmount: {
                    type: 'number',
                    example: 200,
                  },
                  remainingAmount: {
                    type: 'number',
                    example: 325,
                  },
                  status: {
                    type: 'string',
                    enum: ['Active', 'Cleared', 'Late', 'Unknown'],
                    example: 'Active',
                  },
                  utxoRef: {
                    type: 'string',
                    example: 'def456...#0',
                  },
                },
              },
            },
            activeLoans: {
              type: 'integer',
              example: 1,
            },
            totalBorrowed: {
              type: 'number',
              example: 500,
            },
          },
        },
        LoanRequest: {
          type: 'object',
          required: ['amount', 'durationDays'],
          properties: {
            amount: {
              type: 'number',
              example: 500,
              description: 'Loan amount in ADA',
            },
            durationDays: {
              type: 'integer',
              example: 30,
              description: 'Loan duration in days',
            },
          },
        },
        LoanRequestResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Loan request prepared',
            },
            loan: {
              type: 'object',
              properties: {
                borrower: {
                  type: 'string',
                  example: 'addr_test1qz...',
                },
                amount: {
                  type: 'number',
                  example: 500,
                },
                interest: {
                  type: 'number',
                  example: 25,
                },
                totalRepayment: {
                  type: 'number',
                  example: 525,
                },
                dueDate: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-12-29T10:30:00Z',
                },
                durationDays: {
                  type: 'integer',
                  example: 30,
                },
                cbor: {
                  type: 'string',
                  example: 'placeholder_loan_transaction_cbor',
                },
              },
            },
          },
        },
        RepaymentRequest: {
          type: 'object',
          required: ['amount', 'loanUtxoRef'],
          properties: {
            amount: {
              type: 'number',
              example: 200,
              description: 'Repayment amount in ADA',
            },
            loanUtxoRef: {
              type: 'string',
              example: 'def456...#0',
              description: 'UTxO reference of the loan',
            },
          },
        },
        RepaymentResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Repayment transaction prepared',
            },
            repayment: {
              type: 'object',
              properties: {
                borrower: {
                  type: 'string',
                  example: 'addr_test1qz...',
                },
                amount: {
                  type: 'number',
                  example: 200,
                },
                lovelaceAmount: {
                  type: 'integer',
                  example: 200000000,
                },
                loanUtxoRef: {
                  type: 'string',
                  example: 'def456...#0',
                },
                cbor: {
                  type: 'string',
                  example: 'placeholder_repayment_transaction_cbor',
                },
              },
            },
          },
        },
        InvestmentList: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            investments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'INV-001',
                  },
                  projectName: {
                    type: 'string',
                    example: 'Solar Farm',
                  },
                  amountInvested: {
                    type: 'number',
                    example: 10000,
                  },
                  expectedROI: {
                    type: 'number',
                    example: 15,
                    description: 'Expected ROI percentage',
                  },
                  realProfit: {
                    type: 'number',
                    example: 1200,
                  },
                  status: {
                    type: 'string',
                    enum: ['Active', 'Completed', 'Unknown'],
                    example: 'Active',
                  },
                  utxoRef: {
                    type: 'string',
                    example: 'ghi789...#0',
                  },
                },
              },
            },
            summary: {
              type: 'object',
              properties: {
                totalInvestments: {
                  type: 'integer',
                  example: 1,
                },
                totalInvested: {
                  type: 'number',
                  example: 10000,
                },
                totalProfit: {
                  type: 'number',
                  example: 1200,
                },
                roi: {
                  type: 'number',
                  example: 12,
                  description: 'Overall ROI percentage',
                },
              },
            },
          },
        },
        InvestmentRegisterRequest: {
          type: 'object',
          required: ['projectName', 'amount', 'expectedROI'],
          properties: {
            projectName: {
              type: 'string',
              example: 'Solar Farm',
            },
            amount: {
              type: 'number',
              example: 10000,
              description: 'Investment amount in ADA',
            },
            expectedROI: {
              type: 'number',
              example: 15,
              description: 'Expected ROI percentage',
            },
          },
        },
        InvestmentRegisterResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Investment registration prepared',
            },
            investment: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: 'INV-1701234567890',
                },
                projectName: {
                  type: 'string',
                  example: 'Solar Farm',
                },
                amount: {
                  type: 'number',
                  example: 10000,
                },
                expectedROI: {
                  type: 'number',
                  example: 15,
                },
                registeredBy: {
                  type: 'string',
                  example: 'addr_test1qz...',
                },
                cbor: {
                  type: 'string',
                  example: 'placeholder_investment_transaction_cbor',
                },
              },
            },
          },
        },
        BadgesResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            badges: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  assetId: {
                    type: 'string',
                    example: 'policy123...asset456',
                  },
                  quantity: {
                    type: 'string',
                    example: '1',
                  },
                  name: {
                    type: 'string',
                    example: 'Streak Master',
                  },
                },
              },
            },
            totalBadges: {
              type: 'integer',
              example: 1,
            },
          },
        },
        BadgeClaimResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Badge claim prepared',
            },
            badge: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['streak', 'early-repay'],
                  example: 'streak',
                },
                recipient: {
                  type: 'string',
                  example: 'addr_test1qz...',
                },
                cbor: {
                  type: 'string',
                  example: 'placeholder_badge_mint_transaction_cbor',
                },
              },
            },
          },
        },
        EligibilityResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            walletAddress: {
              type: 'string',
              example: 'addr_test1qz...',
            },
            eligibility: {
              type: 'object',
              properties: {
                streakBadge: {
                  type: 'object',
                  properties: {
                    eligible: {
                      type: 'boolean',
                      example: false,
                    },
                    currentStreak: {
                      type: 'integer',
                      example: 0,
                    },
                    requiredStreak: {
                      type: 'integer',
                      example: 10,
                    },
                    reason: {
                      type: 'string',
                      example: 'Need 10+ consecutive savings',
                    },
                  },
                },
                earlyRepayBadge: {
                  type: 'object',
                  properties: {
                    eligible: {
                      type: 'boolean',
                      example: false,
                    },
                    reason: {
                      type: 'string',
                      example: 'No early loan repayments found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Wallet authentication and user management',
      },
      {
        name: 'Savings',
        description: 'Savings management and tracking',
      },
      {
        name: 'Loans',
        description: 'Loan requests and repayments',
      },
      {
        name: 'Investments',
        description: 'Investment tracking and management',
      },
      {
        name: 'Rewards',
        description: 'NFT badges and rewards',
      },
      {
        name: 'Health',
        description: 'API health check',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
