'use client'

import React, { useState, useEffect } from 'react'
import { InstitutionService, Institution, StudentLink } from '@/services/institutions'
import { useAuthStore } from '@/store/authStore'
import { Building2, Users, School, Check, X, Copy, Plus } from 'lucide-react'

export default function InstitutionPage() {
    const { user } = useAuthStore()
    const [institutions, setInstitutions] = useState<Institution[]>([])
    const [loading, setLoading] = useState(true)
    const [students, setStudents] = useState<StudentLink[]>([])
    const [activeTab, setActiveTab] = useState<'details' | 'students'>('details')

    // Forms
    const [joinCode, setJoinCode] = useState('')
    const [createName, setCreateName] = useState('')
    const [createEmail, setCreateEmail] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await InstitutionService.getMyInstitutions()
            setInstitutions(data)

            // If user is admin of any institution, load students
            const adminInst = data.find(i => i.admin === user?.id || user?.is_superuser)
            if (adminInst) {
                const studentData = await InstitutionService.getStudents()
                setStudents(studentData)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await InstitutionService.create({ name: createName, contact_email: createEmail })
            setMessage('Institution created successfully!')
            setCreateName('')
            setCreateEmail('')
            await loadData() // Wait for data to reload
            setActiveTab('details')
        } catch (err) {
            console.error(err)
            setMessage('Failed to create institution.')
        }
    }

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await InstitutionService.join(joinCode)
            setMessage('Join request sent!')
            setJoinCode('')
            loadData()
        } catch (err) {
            console.error(err)
            setMessage('Failed to join institution. Check code.')
        }
    }

    const handleApprove = async (id: number) => {
        try {
            await InstitutionService.approveStudent(id)
            setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'active' } : s))
        } catch (err) {
            console.error(err)
        }
    }

    const handleReject = async (id: number) => {
        try {
            await InstitutionService.rejectStudent(id)
            setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s))
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    // If no institution linked
    if (institutions.length === 0) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Institution Portal</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Join Existing */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <School className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Join an Institution</h2>
                        <p className="text-gray-600 mb-6">Enter the code provided by your school administrator.</p>
                        <form onSubmit={handleJoin} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter 6-character code"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                                Join Institution
                            </button>
                        </form>
                    </div>

                    {/* Create New - visible mostly to admins/staff/superuser */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                            <Building2 className="text-orange-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Register Your School</h2>
                        <p className="text-gray-600 mb-6">Create a new institution profile to manage students.</p>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                type="text"
                                placeholder="School Name"
                                value={createName}
                                onChange={e => setCreateName(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            />
                            <input
                                type="email"
                                placeholder="Contact Email"
                                value={createEmail}
                                onChange={e => setCreateEmail(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            />
                            <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
                                Create Institution
                            </button>
                        </form>
                    </div>
                </div>
                {message && <p className="mt-4 text-center font-medium text-green-600">{message}</p>}
            </div>
        )
    }

    // Show First Institution (Assuming single for now)
    const inst = institutions[0]
    const isAdmin = inst.admin === user?.id || user?.is_superuser

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <School className="w-8 h-8" />
                        {inst.name}
                    </h1>
                    <p className="text-gray-500 mt-1">{inst.address || 'No address set'}</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Institution Code</p>
                    <div className="flex items-center gap-2 mt-1">
                        <code className="text-xl font-mono font-bold text-blue-900">{inst.code}</code>
                        <button onClick={() => navigator.clipboard.writeText(inst.code)} className="text-blue-400 hover:text-blue-600">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* How to Invite Info Box */}
            {isAdmin && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">How to Invite Students</h3>
                        <p className="text-blue-800 text-sm mb-2">
                            Share the <strong>Institution Code</strong> above with your students.
                        </p>
                        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                            <li>Ask students to create their own <strong>PrepGenius account</strong>.</li>
                            <li>Have them go to the <strong>Institution</strong> tab in their dashboard.</li>
                            <li>They should enter the code <strong>{inst.code}</strong> in the "Join an Institution" box.</li>
                            <li>You will see their request in the <strong>Students</strong> tab below to approve.</li>
                        </ol>
                    </div>
                </div>
            )}

            {isAdmin && (
                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Students <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{students.length}</span>
                        </button>
                    </nav>
                </div>
            )}

            {activeTab === 'details' && (
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-2">
                        <h2 className="text-lg font-bold mb-4">About</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Contact Email</label>
                                <p className="text-gray-900">{inst.contact_email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Website</label>
                                <a href={inst.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{inst.website || 'N/A'}</a>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Stats</h2>
                        <div className="text-center p-4">
                            <div className="text-4xl font-bold text-blue-600">{inst.student_count || students.length}</div>
                            <div className="text-gray-500">Total Students</div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'students' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                                {student.student_details.first_name[0]}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {student.student_details.first_name} {student.student_details.last_name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.student_details.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${student.status === 'active' ? 'bg-green-100 text-green-800' :
                                                student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(student.joined_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {student.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(student.id)}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded">
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(student.id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No students found. Share your institution code to invite them!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
