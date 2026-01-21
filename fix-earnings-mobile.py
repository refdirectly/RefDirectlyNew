import re

file_path = 'frontend/src/pages/ReferrerEarningsPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Find and replace the table section
old_table = r'<div className="overflow-x-auto -mx-4 sm:mx-0">.*?</div>\s*\)\}'
new_content = '''<div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Company</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <p className="font-semibold text-gray-900 text-sm">{transaction.description}</p>
                              {transaction.role && (
                                <p className="text-xs text-gray-500 mt-1">{transaction.role}</p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-700">{transaction.company || '-'}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`font-bold text-sm ${
                                transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'earning' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right text-xs text-gray-600">
                              {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-3">
                    {filteredTransactions.map((transaction) => (
                      <div key={transaction._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-3">
                            <p className="font-semibold text-gray-900 text-sm mb-1">{transaction.description}</p>
                            {transaction.role && (
                              <p className="text-xs text-gray-500 mb-1">{transaction.role}</p>
                            )}
                            <p className="text-xs text-gray-600">{transaction.company || '-'}</p>
                          </div>
                          <span className={`font-bold text-lg flex-shrink-0 ${
                            transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'earning' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {transaction.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}'''

content = re.sub(old_table, new_content, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)

print("Mobile-friendly cards added to ReferrerEarningsPage.tsx")
